/*
雀魂大会室大凤林辅助脚本v1.0
*/
localStorage.setItem("i18nextLng", "zh-CN");

function sleep(ms) {//暂停
	return new Promise(resolve => setTimeout(resolve, ms));
}

function ce(arr) {//创建元素
	if (!Array.isArray(arr) || arr.length < 1 || arr.length % 2 == 0) { return; }
	var e = document.createElement(arr[0]);
	for (var i = arr.length - 1; i >= 1; i -= 2) {
		e.setAttribute(arr[i - 1], arr[i]);
	}
	return e;
}
function cet(arr, t) {//创建元素+元素带innertext
	if (!Array.isArray(arr) || arr.length < 1 || arr.length % 2 == 0) { return; }
	var e = document.createElement(arr[0]);
	for (var i = arr.length - 1; i >= 1; i -= 2) {
		e.setAttribute(arr[i - 1], arr[i]);
	}
	e.innerText = t;
	return e;
}

function check_js() {
	return (typeof window.pp != "object") ?
		alert('脚本可能失效了') : true;
}

(function () {//创建工具栏

	var tool_div = ce(['div', "id", "tool_div"]);

	//<--div
	var new_div = document.createElement("div");

	var d = new Date();
	var nowstr = d.getFullYear();
	nowstr += (d.getMonth() < 9 ? "-0" : "-") + (d.getMonth() + 1);
	nowstr += (d.getDate() < 10 ? "-0" : "-") + d.getDate();

	var data_id = ["cid", "c_round", 'c_date', 'c_pw'];
	var data_lable = ["赛事ID:", '回合:', '日期', '赛事密码']
	var data_size = ['2', '2', '10', '6'];
	var data_value = ['0', '1', nowstr, ''];
	var data_type = ["text", "text", "text", "password"];

	for (var i = 0; i < data_id.length; i++) {
		new_div.appendChild(cet(["lable", "for", data_id[i]], data_lable[i]));
		new_div.appendChild(ce(["input",
			"size", data_size[i],
			"type", data_type[i],
			"value", data_value[i],
			"id", data_id[i],
			"onchange", "init_all()"
		]));
		new_div.appendChild(document.createElement("br"));
	}

	tool_div.appendChild(new_div);
	//div-->

	//<--div-tools
	var div_tools = document.createElement("div");
	div_tools.setAttribute("id", "div-tools");

	var btn_value = ["获取成员列表", "开始某个组", "读取牌谱", "未到名單", "切换页面"];
	var btn_onclick = ["init_list()", "init_start()", "send_data()", "init_miss()", "page_change()"];

	for (var i = 0; i < btn_value.length; i++) {

		div_tools.appendChild(ce([
			"input", "type", "button", "value", btn_value[i], "onclick", btn_onclick[i]
		]));
	}
	tool_div.appendChild(div_tools);

	//div-tools->

	//<--div2
	tool_div.appendChild(ce(['div', 'id', 'box']));
	//div2-->
	document.body.appendChild(tool_div);
})()

function page_change() {
	//*[@id="root"]/div/header/div/div[3]/div/div/div/div
	var pg = document.querySelector('#root > div > header > div > div:nth-child(3) > div > div > div > div').children;

	var box = document.getElementById("box");
	box.innerHTML = "";
	for (var i = 0; i < pg.length; i++) {
		box.appendChild(ce([
			"input", "type", "button", "value", pg[i].innerText, "onclick",
			"document.querySelector('#root > div > header > div > div:nth-child(3) > div > div > div > div > button:nth-child(" + (i + 1) + ")').click();"
		]));
	}
}

//----init类---
function init_all() {
	window.team = 1;
	window.cls = 1;
	window.c_admin = 1;
}

function init_miss() {
	var box = document.getElementById("box");
	box.innerHTML = "";

	if (typeof window.miss == "undefined") {
		window.miss = [];
	}

	box.appendChild(ce([
		"textarea", "id", "miss_ta", "value", window.miss.join("\n")
	]));

	box.appendChild(ce([
		"input", "type", "button", "onclick", "clean_miss()", "value", "清空列表"
	]));

	box.appendChild(ce([
		"input", "type", "button", "onclick", "copy_miss()", "value", "複製列表"
	]));
}

async function init_list() {
	//添加一些成员
	var box = document.getElementById("box");
	box.innerHTML = "";
	box.appendChild(ce([
		"textarea", "id", "add_player_text"
	]));

	box.appendChild(ce([
		"input", "type", "button", "onclick", "add_player()", "value", "加入参赛名单"
	]));

	var cid = document.getElementById("cid").value;

	if (!(typeof window.team === "object")) {
		window.team = get_json(
			"https://mahjong.city/api/data.php?t=team&cid=" + cid
		);
	}
	var tmp = "";
	for (row in window.team) {
		tmp += window.team[row]["t_player"] + "\n" + window.team[row]["t_sub"];
	}
	var res = Array.from(new Set(tmp.split(/\s+/)));

	document.getElementById("add_player_text").value = res.join("\n")

	return res;
} //func-->

function init_start() {
	var box = document.getElementById("box");
	box.innerHTML = "";
	var cid = document.getElementById("cid").value;
	var c_round = document.getElementById("c_round").value;

	box.appendChild(ce([
		"textarea", "id", "start_ta", "rows", "4"
	]));

	box.appendChild(ce([
		"input", "type", "button", "onclick", "start_class()", "value", "开始"
	]));

	box.appendChild(document.createElement("br"));

	if (!(typeof window.miss === "object")) {
		window.miss = [];
	}
	if (!(typeof window.c_admin === "object")) {
		window.c_admin = get_json(
			"https://mahjong.city/api/data.php?t=admin&cid=" + cid
		);
	}
	if (!(typeof window.team === "object")) {
		window.team = get_json(
			"https://mahjong.city/api/data.php?t=team&cid=" + cid
		);
	}
	if (!(typeof window.cls === "object")) {
		window.cls = get_json(
			"https://mahjong.city/api/data.php?t=class&cid=" + cid
		);
	}
	if (window.cls === null) {
		return alert("此赛事还没分组，或读取分组失败，请按【重载数据】");
	}
	var cls_count = 0;
	window.this_round = [];
	for (var i = 0; i < window.cls.length; i++) {
		if (
			window.cls[i]["round"] == c_round &&
			window.cls[i]["t_class"] > cls_count
		) {
			cls_count++;
			window.this_round[window.cls[i]["t_class"]] = [
				window.cls[i]["rid"],
				window.cls[i]["tid1"],
				window.cls[i]["tid2"],
				window.cls[i]["tid3"],
				window.cls[i]["tid4"]
			];
		}
	}
	for (var i = 1; i <= cls_count; i++) {
		box.appendChild(ce([
			"input", "type", "button", "onclick", "get_cls(" + i + ")",
			"value", i + "组", "id", "btn_start_" + i
		]));
	}
}

//-------


function copy_miss() {
	document.getElementById("miss_ta").select();
	document.execCommand("Copy");
}

function clean_miss() {
	window.miss = [];
	document.getElementById("miss_ta").value = "";
}

function get_json(url) {
	var xmlhttp = new XMLHttpRequest();
	xmlhttp.open("GET", url, false);
	xmlhttp.send();
	if (xmlhttp.status === 200) {
		return JSON.parse(xmlhttp.responseText);
	} else {
		return null;
	}
}

function set_value(type, txt) {
	//设置值
	var last = window.ee.length - 1;
	window.ee[last][type] = txt;
	window.pp[last].updater.enqueueSetState(
		window.pp[last],
		window.ee[last],
		null,
		"setState"
	);
}

function get_cls(cls) {
	var arr = get_json(
		"https://mahjong.city/api/maj_get.php?p=" +
		window.c_admin.c_s_po +
		"&data=" +
		window.this_round[cls].join("_") +
		"&t=" +
		encodeURI(window.c_admin.t_type)
	);
	if (arr === null || arr === "") {
		return alert("获取第" + cls + "组开赛名单失败");
	}
	if (arr[0] == "2") {
		return alert(arr[1]);
	}
	document.getElementById("start_ta").value = arr[1];
}

async function add_player(str) {
	if (typeof str === "undefined") {
		str = document.getElementById("add_player_text").value;
	}
	document
		.querySelector(
			"#root>div>header>div>div:nth-child(3)>div>div>div>div>button:nth-child(1)"
		)
		.click();
	await sleep(2000);
	window.ee = []; //重设缓存
	window.pp = []; //重设缓存
	document
		.querySelector(
			"#root>div>header>div>div:nth-child(3)>div>div>div>div>button:nth-child(2)"
		)
		.click();
	await sleep(3000);
	document
		.querySelector(
			"#root>div>div>main>div:nth-child(2)>div>div>button:nth-child(3)"
		)
		.click();
	await sleep(1000);
	var eelast = window.ee.length - 1;
	window.ee[eelast].query = str;
	window.pp[eelast].updater.enqueueSetState(
		window.pp[eelast],
		window.ee[eelast],
		null,
		"setState"
	);
	await sleep(1000);
	document
		.querySelector("body>div>div:nth-child(2)>div>div:nth-child(3)>button")
		.click();
	//await sleep(1000);
	//document.querySelector('body>div>div:nth-child(2)>div>div:nth-child(3)').lastChild.click();
}

async function start_class() {
	var narr = [];
	var parr = [];
	var tmp = [];
	var ta = document.getElementById("start_ta").value.split(/[\r\n]+/);
	for (var i = 0; i < ta.length; i++) {
		tmp = ta[i].replace(/^\s+|\s+$/g, "").split(/[\s]+/);
		if (tmp.length === 1) {
			narr[i] = "";
			parr[i] = tmp[0];
		} else {
			narr[i] = tmp[0];
			parr[i] = tmp[1];
		}
	}

	document
		.querySelector(
			"#root>div>header>div>div:nth-child(3)>div>div>div>div>button:nth-child(1)"
		)
		.click();
	await sleep(3000);
	window.ee = []; //重设缓存
	window.pp = []; //重设缓存
	document
		.querySelector(
			"#root>div>header>div>div:nth-child(3)>div>div>div>div>button:nth-child(3)"
		)
		.click();
	await sleep(5000);

	var list = document.querySelector(
		"#root>div>div>main>div:nth-child(2)>div>div>div>div:nth-child(2)>ul"
	).childNodes;
	var set = ["x", "x", "x", "x"];
	var cnt = 0;

	for (var ii = 0; ii < 4; ii++) {
		if (narr[ii] === null || narr[ii] === "") {
			document
				.querySelector(
					"#root>div>div>main>div:nth-child(2)>div>div>div:nth-child(2)>div:nth-child(3)>button"
				)
				.click();
			set[ii] = parr[ii];
			cnt++;
			await sleep(2000);
		} else {
			for (var i = 0; i < list.length; i++) {
				if (list[i].childNodes[0].childNodes[0].innerText == narr[ii]) {
					list[i].childNodes[1].childNodes[0].click();
					set[ii] = parr[ii];
					cnt++;
					await sleep(2000);
				}
			}
		}
	}
	var missarr = "以下選手未到\n";
	if (cnt < 4) {
		for (var i = 0; i < 4; i++) {
			if (set[i] == "x") {
				window.miss.push(narr[i]);
				missarr += narr[i] + "\n";
			}
		}
		return alert(missarr);
	}

	await sleep(2000);
	var eelast = window.ee.length - 1;
	window.ee[eelast].prepareSlot[0].initPoint = set[0];
	window.ee[eelast].prepareSlot[1].initPoint = set[1];
	window.ee[eelast].prepareSlot[2].initPoint = set[2];
	window.ee[eelast].prepareSlot[3].initPoint = set[3];
	window.pp[eelast].updater.enqueueSetState(
		window.pp[eelast],
		window.ee[eelast],
		null,
		"setState"
	);

	if (cnt === 4) {
		//----點擊隨機按鈕---
		await sleep(1000);
		document
			.querySelector(
				"#root>div>div>main>div:nth-child(2)>div>div>div:nth-child(2)>div:nth-child(2)>label:nth-child(2)>span>span>input"
			)
			.click();
		await sleep(1000);
		//document.querySelector('#root>div>div>main>div:nth-child(2)>div>div>div:nth-child(2)>div:nth-child(3)').lastChild.click();
		alert("信息已填好，请点击开始");
	}
}

async function send_paipu() {
	var formdata = new FormData();
	formdata.append("cid", document.getElementById("cid").value);
	formdata.append("pw", document.getElementById("c_pw").value);
	formdata.append("rnd", document.getElementById("c_round").value);
	formdata.append("json", document.getElementsByName("json")[0].value);
	fetch("https://mahjong.city/api/maj_post.php", {
		method: "POST",
		body: formdata
	}).then(async (response) => {
		var rjson = await response.json(); // parses response to JSON
		console.log(rjson);
		alert(rjson.msg);
	})
}

async function send_data() {
	page = 1

	var box = document.getElementById("box");
	box.innerHTML = "";
	document
		.querySelector(
			"#root>div>header>div>div:nth-child(3)>div>div>div>div>button:nth-child(1)"
		)
		.click();
	await sleep(2000);
	window.ee = []; //重设缓存
	window.pp = []; //重设缓存
	window.tb = []; //重设缓存
	document
		.querySelector(
			"#root>div>header>div>div:nth-child(3)>div>div>div>div>button:nth-child(4)"
		)
		.click();
	await sleep(2000);
	while (document.getElementsByTagName("tr").length < 2) {
		await sleep(1000);
	}
	console.log("go", document.getElementsByTagName("tr").length)
	page = (page > 1) ? page : 1;

	while (page--) {
		var nowstr = document.getElementById("c_date").value;
		var x = document.getElementsByTagName("tr");
		for (var i = 1; i < x.length; i++) {
			try {
				if (
					x[i].childNodes[1].innerText.indexOf(nowstr) === 0 &&
					x[i].childNodes[6].innerText.replace(/^\s+|\s+$/g, "") != "pass"
				) {
					var tmparr = [];
					tmparr[0] = x[i].childNodes[1].innerText;
					for (let j = 1; j <= 4; j++) {
						tmparr[j] = x[i].childNodes[1 + j].innerText.split(" ");
						let last = tmparr[j].length - 1;
						tmparr[j] = tmparr[j][last - 1] + " " + tmparr[j][last];
					}
					tmparr[5] = x[i].childNodes[6].innerText;
					x[i].childNodes[6].childNodes[0].children[1].click();
					tmparr[6] = window.ee[window.ee.length - 1].uuidEdit;
					window.tb.push(tmparr);
				}
			} catch (error) { console.log(error); }
		}
		await window.tb;
		document.querySelector("#root > div > div > main > div > div > div > div > div > div > div > button:nth-child(2)").click();

	}//while

	await window.tb;
	console.log(window.tb);

	if (window.tb.length == 0) {
		return alert("读取到的牌谱是空的，请注意左下角的日期和牌谱日期是否一致");
	}
	var paipu_isnull = false;
	for (let i = window.tb.length; i--;) {
		if (window.tb[i][6] == "") { paipu_isnull = true }
	}
	var ta = ce([
		"textarea", "name", "json"]);
	ta.value = JSON.stringify(window.tb);
	box.appendChild(ta);
	box.appendChild(ce([
		"input", "type", "submit", "value", "发送", "onclick", "send_paipu()"
	]));

	if (paipu_isnull) {
		return alert("有牌谱链接读取不出，脚本执行完之前，不要乱点击。【请重新读取牌谱】");
	}

	if (confirm("读取牌谱好像成功了，是否直接提交数据？\n※若需要调整分数，可以先在这里选【取消】，改文本框的JSON数据后手动提交")) {
		send_paipu();
	}

} //func