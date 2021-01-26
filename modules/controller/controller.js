false && (window.navigator.plugins.namedItem('Native Client') !== null) 
	&& nw.Window.get().showDevTools();
const os = require("os");
const fs = require("fs");
const path = require("path");
const pkg = require("../../package");
const { BroadcastChannelRPC : FlowRPC } = require("@aspectron/flow-rpc");
const utils = require('@aspectron/flow-utils');
const Manager = require("../../lib/manager.js");
const Console = require("../../lib/console.js")
const StatsD = require('node-statsd');

import {html, render} from 'lit-html';
import {repeat} from 'lit-html/directives/repeat.js';
import {
	flow, FlowDialog, i18n, getLocalSetting, setLocalSetting, T, dpc,
	FlowApp
} from '/node_modules/@aspectron/flow-ux/flow-ux.js';
window.testI18n = (testing)=>i18n.setTesting(!!testing);
window.getLocalSetting = getLocalSetting;
window.setLocalSetting = setLocalSetting;


class KDXApp extends FlowApp{
	render(){
		let list = [
			['Kaspa','MIT','Copyright (c) 2020 Kaspa Developers'],
			['PostgreSQL','PostgreSQL','Portions Copyright © 1996-2020, The PostgreSQL Global Development Group<br/>Portions Copyright © 1994, The Regents of the University of California'],
			['Mosquitto','EDL-V10 EPL-V10','Copyright (c) 2007, Eclipse Foundation, Inc. and its licensors'],
			['Flow-UX Framework','MIT', 'Copyright (c) ASPECTRON Inc.'],
			['NWJS','MIT','Copyright (c) 2015 四月橘林'],
			['Chromium','BSD', 'Copyright (c) The Chromium Authors']
			// ['Kaspa','MIT','Copyright (c) 2020 Kaspa Developers'],
			// ['Kaspa','MIT','Copyright (c) 2020 Kaspa Developers'],
		];
		return html`
		<flow-caption-bar
			logo="/resources/images/kaspa-logo-light-bg.png">KDX</flow-caption-bar>
		<tab-content for="home">
			<flow-form-control id="applications" icon="fal:fire" no-help style='display:none;'>
				<flow-i18n caption>Applications</flow-i18n>
				<div id="application-list"></div>
			</flow-form-control>
			<flow-form-control icon="fal:database" no-help>
				<flow-i18n caption>Services</flow-i18n>
				<div id='process-info-table' class="task-info-container">
				</div>
			</flow-form-control>
			<div id='kaspa-resources'>

				<flow-expandable>
					<div slot="title" is="i18n-div" caption>KASPA RESOURCES</div>
					<ul style="font-size: 12px;">
						<li>
							<flow-shell-link href="https://docs.kas.pa/kaspa/about-kaspa/get-started">
								<flow-i18n>Documentation</flow-i18n>
							</flow-shell-link>
						</li>
						<li><flow-shell-link
							href="https://github.com/kaspanet/"><flow-i18n>GitHub</flow-i18n></flow-shell-link></li>
						<li><flow-shell-link
							href="https://discord.gg/vMT39xB"><flow-i18n>Discord Chat</flow-i18n></flow-shell-link></li>
						<li><flow-link
							id="release-notes-link"><flow-i18n>Release Notes</flow-i18n></flow-link></li>
					</ul>
				</flow-expandable>
			</div>
			<div id='license-info'>
				<flow-form-control icon="fal:copyright">
					<flow-i18n>KDX &amp; Kaspa Copyright (c) 2020 Kaspa Developers<br/>
					All Rights Reserved.</flow-i18n><br/>
				</flow-form-control>
				<flow-expandable no-info class="license-info" >
					
					<div slot="title" is="i18n-div" caption>LICENSE INFORMATION</div>

					<div style="font-weight:bold;font-size: 0.85rem;">

						<div id="license-text">
							${list.map((t) => {
								let [name, license, copy] = t;
								return html`
								<project>
									<name><flow-i18n>${name}</flow-i18n></name>
									<span class='license'><flow-i18n>LICENSE</flow-i18n>:</span>
									<license><flow-i18n>${license}</flow-i18n></license>
									<br/>
									<copyright><flow-i18n>${copy}</flow-i18n></copyright>
								</project>`;
							})}
						</div>

					</div>

				</flow-expandable>
			</div>
		</tab-content>
		<tab-content for="settings">
			<flow-form-control icon="fal:database">
				<flow-i18n slot="title">Data Folder</flow-i18n>
				<flow-folder-input slot="input" id="data-folder-input"></flow-folder-input>
				<div slot="input" class="slot-block data-folder-input-tools">
					<flow-btn
						class="reset-data-dir"><flow-i18n>Reset</flow-i18n></flow-btn>
					<flow-btn
						class="use-default-data-dir"><flow-i18n>Default</flow-i18n></flow-btn>
					<flow-btn
						class="apply-data-dir" primary><flow-i18n>Apply</flow-i18n></flow-btn>
				</div>
				
				<h4 slot="info" class="title"><flow-i18n>Data Folder</flow-i18n></h4>
				<p slot="info" is="i18n-p">
					Data Folder location is used for storage by all KDX modules. 
					In default configuration this includes Kaspad blockchain data and Kasparov API database.
					This location also contains process log files.
				</p>
			</flow-form-control>
			<flow-form-control icon="fal:palette">
				<flow-i18n slot="title">User Interface Color Theme</flow-i18n>
				<flow-checkbox id="settings-dark-theme" 
					class="block"><flow-i18n>Dark Theme</flow-i18n></flow-checkbox>
				<flow-checkbox id="settings-invert-terminal"
					class="block advanced-tool"><flow-i18n>Invert Terminal Color</flow-i18n></flow-checkbox>
			</flow-form-control>
			<flow-form-control icon="fal:tools">
				<flow-i18n slot="title">Turn ON/OFF advanced settings and process control</flow-i18n>
				<flow-checkbox id="settings-advanced" slot="input" class="block">
				<flow-i18n>Advanced</flow-i18n>
				</flow-checkbox>
				<h4 slot="info" class="title"><flow-i18n>Advanced mode</flow-i18n></h4>
				<p slot="info" is="i18n-p">
					Advanced mode allows you to manually configure, interact with and monitor KDX services.
				</p>
			</flow-form-control>
			<flow-form-control icon="fal:cog" class="advanced-tool">
				<flow-i18n slot="title">Service Control</flow-i18n>
				<flow-checkbox id="settings-run-in-bg" class="block advanced-tool"
					slot="input"><flow-i18n>Run in Background</flow-i18n></flow-checkbox>
				<h4 slot="info" class="title"><flow-i18n>Background Execution</flow-i18n></h4>
				<p slot="info" is="i18n-p">
					When enabled, KDX runs itself and it's services hidden in the background
					and becomes accessible via the menu bar (OSX &amp; Linux) or system tray menu (on Windows).
				</p><!-- '-->
			</flow-form-control>
			<flow-form-control icon="fal:cube" _expandable
				class="xadvanced-tool" id="block-generation">
				<flow-i18n slot="title">Block Generation</flow-i18n>
				<flow-checkbox id="settings-enable-mining" class="block"
					><flow-i18n>Enable Mining</flow-i18n></flow-checkbox>
				<flow-input id="mining-address-input" class="block"
					label="Mining address" apply-btn
					btnText="Update">
				</flow-input>
				<flow-checkbox id="settings-use-wallet-address" class="block"
					><flow-i18n>Use Wallet Address</flow-i18n></flow-checkbox>

				<h4 slot="info" class="title"><flow-i18n>Block Generation</flow-i18n></h4>
				<p slot="info" is="i18n-p">
					The Enable Mining option starts / stops all configured Kaspaminer instances.
				</p>
			</flow-form-control>
			<flow-form-control icon="fal:drafting-compass" class="advanced-tool">
				<flow-i18n caption>Metrics</flow-i18n>
				<flow-checkbox id="settings-enable-metrics"
					class="block advanced-tool"
					slot="input"><flow-i18n>Enable Metrics</flow-i18n></flow-checkbox>

				<flow-input id="settings-statsd-address"
					class="block advanced-tool input-ctl-margin"
					placeholder=""
					label="STATSD ADDRESS"
					slot="input"></flow-input>
				<flow-input id="settings-statsd-prefix" 
					class="block advanced-tool input-ctl-margin"
					label="STATSD PREFIX"
					placeholder=""
					slot="input"></flow-input>

				<h4 slot="info" class="title"><flow-i18n>Metrics</flow-i18n></h4>
				<p slot="info" is="i18n-p">
					You can stream KDX metrics to your own StatsD-compatible server.
				</p>
			</flow-form-control>

			<flow-form-control id="settings-script" icon="fal:tasks">
				<flow-i18n slot="title">Service Configuration</flow-i18n>
				<div slot="input" class="settings-script">
					<div class="script-box"></div>
					<div class="tools">
						<flow-btn class="save-config"><flow-i18n>Apply</flow-i18n></flow-btn>
					</div>
				</div>
				<h4 slot="info" class="title"><flow-i18n>Service Configuration</flow-i18n></h4>
				<p slot="info" is="i18n-p">
					Configuration editor allows you to customize KDX environment.
					KDX configuration is represented in JSON
					by a list of application/service configuration objects.
					Each service configuration object is used 
					to start the corresponding service.
				</p>
			</flow-form-control>

			<flow-form-control id="settings-templates" icon="fal:file-alt"
				class="advanced-tool">
				<flow-i18n slot="title">Configuration Templates</flow-i18n>
				<div slot="input" class="h-box-stretched-group" style="margin-top:16px;">
					<div row>
						<flow-selector style="margin-right:32px;" id="template-list" mergeattributes="value" 
							mergeinnerhtml label="Select Configuration Template"
							selected="" class="template-list"></flow-selector>
						<flow-selector id="network-list" label="Network"
							mergeattributes="value" mergeinnerhtml
							selected="testnet" class="network-list">
							<div class="menu-item" value="mainnet">MAINNET</div>
							<div class="menu-item" value="testnet">TESTNET</div>
							<div class="menu-item" value="devnet">DEVNET</div>
							<div class="menu-item" value="simnet">SIMNET</div>
						</flow-selector>
					</div>
					<flow-btn id="load-config" class="load-config" full-height-wrapper warning><flow-i18n>Reset</flow-i18n></flow-btn>
				</div>
				<h4 slot="info" class="title"><flow-i18n>Configuration Templates</flow-i18n></h4>
				<p slot="info" is="i18n-p">
					Configuration templates allow you to load pre-made KDX configurations.
				</p>
			</flow-form-control>
			<div style="height:192px;"></div>
		</tab-content>
		<tab-content for="wallet" class="wallet" data-active-display="flex">
			<kdx-wallet-open-dialog></kdx-wallet-open-dialog>
			<kdx-wallet></kdx-wallet>
		</tab-content>
		<tab-content for="console" data-active-display="flex" class="vertical-flex term">
			<flow-terminal id="kdx-console" class="x-terminal" background="#000" foreground="#FFF"></flow-terminal>
		</tab-content>
		<app-startup-dialog id="release-notes-dialog"></app-startup-dialog>`
	}
	constructor(){
		super();
		//let doc = document;
		this.qS = this.querySelector.bind(this);
		//testDialogs();
		this.debug = getLocalSetting('debug-ctx')==1;
		//this.init();
	}

	createRenderRoot(){
		return this;
	}
	
	connectedCallback(){
		super.connectedCallback();
		dpc(e=>this.init(), 200);
	}
	async init(){
		this.taskTabs = {};
		this.taskTerminals = {};
		this.initWin();
		this.initTrayMenu();
		this.initRPC();
		this.initI18n();
		this.initTheme();
		this.initCaption();
		await this.initManager();
		await this.initConsole();
		await this.initWallet();
		
		
		this.initTemplates();
		await this.initSettings();
		this.setUiLoading(false);
	}
	setUiLoading(loading){
		document.body.classList.toggle("ui-loading", loading);
	}
	setUiDisabled(disabled){
		document.body.classList.toggle("disable", disabled);
	}
	initRPC(){
		let rpc = new FlowRPC({bcastChannel:'kdx'});
		this.rpc = rpc;

		rpc.on("disable-ui", (args)=>{
			this.setUiDisabled(true)
		});
		rpc.on("enable-ui", (args)=>{
			this.setUiDisabled(false)
		});
		rpc.on("alert", (args)=>{
			alert('alert');
		});	
	}
	async initI18n(){
		window.addEventListener("flow-i18n-entries-changed", e=>{
			let {entries} = e.detail;
			// console.log("entries", entries)
			this.post("set-app-i18n-entries", {entries})
		});
		let {entries} = await this.get("get-app-i18n-entries");
		//console.log("entries", entries)
		//let ce = new CustomEvent("flow-i18n-entries", {detail:{entries}})
		//window.dispatchEvent(ce)
		i18n.setActiveLanguages(['en', 'ja']);
		i18n.setEntries(entries);
		this.post("set-app-i18n-entries", {entries:i18n.getEntries()})
		//i18n.setTesting(true);
	}
	async initManager(){
		this.initData = await this.get("get-app-data");
		let {dataFolder, appFolder, config} = this.initData;
		let manager = global.manager || new Manager(this, dataFolder, appFolder);
		manager.enableMining = config.enableMining;
		if(global.manager){
			manager.controller = this;
			manager.dataFolder = dataFolder;
			manager.appFolder = appFolder;
		}

		this.manager = manager;
		manager.on("task-info", async (daemon)=>{
			if(!daemon.renderModuleInfo)
				return

			let {task} = daemon;

			let info = await daemon.renderModuleInfo({html});
			let section = html`<div class="task-info">${info}</div>`;
			this.renderModuleInfo(task, section);
		})
		manager.on("task-start", (daemon)=>{
			console.log("init-task:task", daemon.task)
			this.initTaskTab(daemon.task);
			this.refreshApps();
			const {wallet} = this;
			if(!wallet || daemon.task.type!='kaspad' || !this.rpcDisconnect){
				return
			}

			this.rpcDisconnect = false;
			wallet.connectRPC();

		});
		manager.on("task-exit", (daemon)=>{
			console.log("task-exit", daemon.task)
			this.removeTaskTab(daemon.task);
		})
		manager.on("before-interrupt", ({daemon, interrupt})=>{
			console.log("before-interrupt", daemon.task.type, daemon.task)
			const {wallet} = this;
			if(!wallet || daemon.task.type!='kaspad')
				return
			wallet.disconnectRPC();
			this.rpcDisconnect = true;
		})
		manager.on("task-data", (daemon, data)=>{
			//console.log("task-data", daemon.task, data)
			let terminal = this.taskTerminals[daemon.task.key];
			if(!terminal || !terminal.term)
				return
			//data.map(d=>{
				//console.log("data-line", d.trim())
				//terminal.writeToResidentBuffers(data.toString('utf8').replace(/\n/g,'\r\n')); //(d.trim());
				terminal.term.write(data.toString('utf8').replace(/\n/g,'\r\n')); //(d.trim());
			//});
		});

		if(global.manager){
			let {config:daemons} = await this.get("get-modules-config");
			if(!daemons)
				return "Could Not load modules."
			console.log("restartDaemons", daemons)
			this.restartDaemons(daemons);
		}else{
			this.initDaemons();
		}

		global.manager = manager;
	}
	async initWallet() {
		let wallet = this.qS('kdx-wallet');
		let settings = await this.get_default_local_kaspad_settings();
		wallet.setNetworkSettings(settings);
		this.wallet = wallet;
		return Promise.resolve();
	}
	async get_default_local_kaspad_settings() {
		
		let {config:daemons} = await this.get("get-modules-config");
		console.log("############### DAEMONS", daemons);
		let kaspad = Object.entries(daemons).map(([k,v]) => { 
			const { args } = v;
			const [type, ident] = k.split(':');
			return { type, ident, args};
		}).filter(o=>o.type=='kaspad').shift();

		if(!kaspad)
			return null;

		const { args } = kaspad;
		let networkType = ['testnet','devnet','simnet'].filter(v=>args[v] !== undefined).shift() || 'mainnet';
		let network = {
			mainnet : 'kaspa',
			testnet : 'kaspatest',
			devnet : 'kaspadev',
			simnet : 'kaspasim'
		}[networkType];
		let { rpclisten } = args;
		let port = parseInt(rpclisten.split(':').pop());
		return { network, port };
	}
	async initConsole() {
		let terminal = this.qS('#kdx-console');
		this.console = new Console(this, terminal);

		return Promise.resolve();
	}
	async initTheme(){
		let {theme, invertTerminals} = await this.get("get-app-config");
		this.setTheme(theme || 'light');
		this.setInvertTerminals(!!invertTerminals);
	}
	setInvertTerminals(invertTerminals){
		this.invertTerminals = invertTerminals;
		this.post("set-invert-terminals", {invertTerminals});
		document.body.classList.toggle("invert-terminals", invertTerminals)
		document.body.dispatchEvent(new CustomEvent("flow-theme-changed"));
	}
	setRunInBG(runInBG){
		this.runInBG = !!runInBG;
		this.post("set-run-in-bg", {runInBG});
	}
	setEnableMining(enableMining){
		this.enableMining = !!enableMining;
		this.post("set-enable-mining", {enableMining});
		this.manager.setEnableMining(this.enableMining);
	}
	setStatsdAddress(statsdAddress){
		// console.log("setStatsdAddress", address)
		this.statsdAddress = statsdAddress;
		this.post("set-statsd-address", {statsdAddress});
		this.initStatsdServer(this.statsdAddress, this.statsdPrefix, true);
	}
	setStatsdPrefix(statsdPrefix){
		// console.log("setStatsdPrefix", prefix)
		this.statsdPrefix = statsdPrefix;
		this.post("set-statsd-prefix", {statsdPrefix});
		this.initStatsdServer(this.statsdAddress, this.statsdPrefix, true);
	}
	setEnableMetrics(enableMetrics){
		this.enableMetrics = !!enableMetrics;
		this.post("set-enable-metrics", {enableMetrics});
	}
	setBuildType(build){
		this.buildType = build;
		this.post("set-build-type", {build});
	}
	setTheme(theme){
		if(!this.rpc)
			return
		this.theme = theme;
		if(this.caption)
			this.caption.logo = `/resources/images/kaspa-logo-${theme}-bg.png`
		this.post("set-app-theme", {theme});
		document.body.classList.forEach(c=>{
			if(c.indexOf('flow-theme') === 0 && c!='flow-theme'+theme){
				document.body.classList.remove(c);
			}
		})

		document.body.classList.add("flow-theme-"+theme)

		if(this.configEditor){
			if(this.theme == 'dark')
				this.configEditor.setTheme("ace/theme/tomorrow_night_eighties");
			else
				this.configEditor.setTheme("ace/theme/chrome");
		}

		document.body.dispatchEvent(new CustomEvent("flow-theme-changed"));
	}
	initCaption(){
		let caption = this.qS('flow-caption-bar');
		console.log("caption", caption)
		this.caption = caption;
		this.caption.close = this.closeWin;
		this.caption.logo = `/resources/images/kaspa-logo-${this.theme}-bg.png`;

		caption.version = pkg.version;

		caption.tabs = [{
			title : "WALLET",
			id : "wallet"
		},{
			title : "KASPA",
			id : "home",
			cls: "home"
		},{
			title : "SETTINGS",
			id : "settings"
		},{
			title : "CONSOLE",
			id : "console",
			disable:true,
			section: 'advanced'
		}];

		caption["active"] = "wallet";
	}
	initTrayMenu() {
		let tray = new nw.Tray({
			icon: 'resources/images/tray-icon.png',
			alticon:'resources/images/tray-icon.png',
			iconsAreTemplates: false
		});

		this.tray = tray;

		if(os.platform != 'darwin')
			tray.title = 'KDX';

		let menu = new nw.Menu();
		this.showMenu = new nw.MenuItem({ 
			label : 'Show',
			enabled: false,
			click : () => {
				this.showWin();
			}
		})
		menu.append(this.showMenu);
		menu.append(new nw.MenuItem({ 
			label : 'Exit',
			click : () => {
				this.exit();
			}
		}));

		tray.menu = menu;
	}

	async initTemplates() {
		try {
			this.templates = JSON.parse(fs.readFileSync(path.join(this.manager.appFolder, '.templates'))+'');
		} catch(ex) {
			alert('Error loading configuration templates file .templates:\n\n'+ex+'');
		}

		const qS = this.qS;
		let tplEl = qS('#template-list');
		let netEl = qS('#network-list');
		let html = Object.entries(this.templates).map(([ident,tpl]) => {
			return `<div class="menu-item" value="${ident}">${tpl.description}</div>`;
		}).join('');
		tplEl.innerHTML = html;

		const blockgenEl = qS("#block-generation");

		if(!this.tpl_template) {
			let {config} = this.initData;
			this.tpl_template = config.ident;
			this.tpl_network = config.network;

			let miner = Object.keys(config.modules).filter(v=>/^kaspaminer/.test(v));
			if(!miner.length)
				$(blockgenEl).addClass('no-mining');
		}

		tplEl.setAttribute('selected',this.tpl_template);
		netEl.setAttribute('selected',this.tpl_network);

		window.addEventListener('select', (e) => {
			let { selected } = e.detail;
			switch(e.target.id) {
				case 'network-list': {
					this.tpl_network = selected;
				} break;

				case 'template-list': {
					this.tpl_template = selected;
				} break;
			}
		})

		const loadConfigBtn = qS("#load-config");
		loadConfigBtn.addEventListener('click', async (e) => {	

			let config = this.templates[this.tpl_template];
			let network = this.tpl_network;

			//this.saveModulesConfig(config);
			config = await this.setConfigTemplate(config, network);
			this.configEditor.session.setValue(JSON.stringify(config.modules, null, "\t"));

			let miner = Object.keys(config.modules).filter(v=>/^kaspaminer/.test(v));
			if(miner.length)
				$(blockgenEl).removeClass('no-mining');
			else
				$(blockgenEl).addClass('no-mining');
		});
	}

	async initSettings(){
		const doc = document;
		const qS = this.qS;
		const qSA = this.qSA = doc.querySelectorAll.bind(doc);
		let themeInput = qS("#settings-dark-theme");
		let invertTermInput = qS("#settings-invert-terminal");
		let runInBGInput = qS("#settings-run-in-bg");
		let enableMiningInput = qS("#settings-enable-mining");
		let miningAddressInput = qS("#mining-address-input");
		let scriptHolder = qS('#settings-script');
		let advancedInput = qS('#settings-advanced');
		let statsdAddressInput = qS('#settings-statsd-address');
		let statsdPrefixInput = qS('#settings-statsd-prefix');
		let enableMetricsInput = qS('#settings-enable-metrics');
		advancedInput.addEventListener('changed', (e)=>{
			let advanced = this.advanced = e.detail.checked;
			let index = this.caption.tabs.forEach((t, index)=>{
				if(t.section == 'advanced'){
					this.caption.set(`tabs.${index}.disable`, !advanced)
				}
			});

			localStorage.advancedUI = advanced?1:0;
			
			scriptHolder.classList.toggle("active", advanced)
			doc.body.classList.toggle("advanced-ui", advanced)

			this.refreshApps();
		});
		advancedInput.setChecked(localStorage.advancedUI==1);
		this.configEditor = ace.edit(scriptHolder.querySelector(".script-box"), {
			mode : 'ace/mode/javascript',
			selectionStyle : 'text'
		});
		if(this.theme == 'dark')
			this.configEditor.setTheme("ace/theme/tomorrow_night_eighties");
		else
			this.configEditor.setTheme("ace/theme/dawn");
		this.configEditor.setOptions({
			fontSize: "14px",
			fontFamily: "Source Code Pro"
		});
		
		this.configEditor.session.setUseWrapMode(false);
		this.configEditor.session.on('change', (delta) => {
			//let script = this.configEditor.session.getValue();
		});
		let {config, configFolder, modules} = this.initData;
		this.disableConfigUpdates = true;
		this.configEditor.session.setValue(JSON.stringify(modules, null, "\t"));
		this.disableConfigUpdates = false;
		$("flow-btn.save-config").on("click", ()=>{
			let config = this.configEditor.session.getValue();
			this.saveModulesConfig(config);
		})

		let $folderInput = $("#data-folder-input");
		let folderInput = $folderInput[0];
		let originalValue = config.dataDir || configFolder;
		folderInput.value = originalValue;
		$(".reset-data-dir").on("click", e=>{
			folderInput.setValue(originalValue);
		});
		$(".apply-data-dir").on("click", async(e)=>{
			this.setUiDisabled(true);
			let err = await this.get("set-app-data-dir", {dataDir:folderInput.value});
			console.log("err:", err)
			this.setUiDisabled(false);
		});
		$(".use-default-data-dir").on("click", e=>{
			folderInput.setValue(configFolder);
		});
		$folderInput.on("changed", (e)=>{
			let value = folderInput.value;
			console.log(originalValue, value);
			$('.data-folder-input-tools').toggleClass("active", value!=originalValue);
			$(".apply-data-dir").attr('disabled', value?null:true);
			$('.use-default-data-dir')[0].disabled = value==configFolder;
		});


		this.initReleaseNotes();

		themeInput.addEventListener('changed', (e)=>{
			let theme = e.detail.checked ? 'dark' : 'light';
			this.setTheme(theme);
		});
		invertTermInput.addEventListener('changed', (e)=>{
			this.setInvertTerminals(e.detail.checked);
		});
		runInBGInput.addEventListener('changed', (e)=>{
			this.setRunInBG(e.detail.checked);
		});
		enableMiningInput.addEventListener('changed', (e)=>{
			this.setEnableMining(e.detail.checked);
		});
		miningAddressInput.addEventListener('btn-click', async (e)=>{
			let address = await this.wallet.getMiningAddress();
			if(address)
				miningAddressInput.value = address;
		})
		statsdAddressInput.addEventListener('changed', (e)=>{
			this.setStatsdAddress(e.detail.value);
		});
		statsdPrefixInput.addEventListener('changed', (e)=>{
			this.setStatsdPrefix(e.detail.value);
		});
		enableMetricsInput.addEventListener('changed', (e)=>{
			this.setEnableMetrics(e.detail.checked);
		});

		themeInput.checked = config.theme == 'dark';
		invertTermInput.checked = !!config.invertTerminals;
		runInBGInput.checked = !!config.runInBG;
		enableMetricsInput.checked = !!config.enableMetrics;
		enableMiningInput.checked = !!config.enableMining;
		this.statsdAddress = statsdAddressInput.value = config.statsdAddress || "";
		this.statsdPrefix = statsdPrefixInput.value = config.statsdPrefix || "kdx.$HOSTNAME";
		this.runInBG = runInBGInput.checked;
		this.enableMining = enableMiningInput.checked;
		this.buildType = config.build || 'generic';
	
		this.manager.enableMining = this.enableMining;
		//this.manager.setEnableMining(this.enableMining);
		flow.samplers.registerSink(this.sampler_sink.bind(this));
		this.initStatsdServer(this.statsdAddress,this.statsdPrefix);
	}
	initReleaseNotes(){
		let dialog = this.qS("#release-notes-dialog");
		let readmeContent = fs.readFileSync(path.join(this.manager.appFolder, 'README.md'))+"";
		let changelogContent = fs.readFileSync(path.join(this.manager.appFolder, 'CHANGELOG.md'))+"";
		dialog.content = 
`#	Welcome to KDX ${pkg.version}!

Useful resources:
- Kaspa Documentation: https://docs.kas.pa 
- Kaspa Discord: https://discord.gg/vMT39xB
- Kaspa GitHub: https://github.com/kaspanet/
- KDX GitHub: https://github.com/aspectron/kdx

${changelogContent}`;
		$("#release-notes-link").on("click", ()=>{
			window.showReleaseNotesDialog(true);
		});

		if(getLocalSetting('version')!=pkg.version){
			setLocalSetting('version', pkg.version);
			window.showReleaseNotesDialog(true);
		}
	}
	initTaskTab(task){
		const advanced = document.querySelector('#settings-advanced').checked;
		const {key, name} = task;
		const {caption} = this;
		let tab = caption.tabs.find(t=>t.id == key);
		//console.log("tab", tab, key, name)
		
		let lastValue = caption.cloneValue(caption.tabs);
		if(tab){
			tab.disable = !advanced;
			console.log("tab.disable", tab)
		}else{
			caption.tabs.push({
				title:name,
				id:key,
				section:'advanced',
				disable:!advanced,
				render:()=>{
					// console.log("renderTab:",task);

					const impl = this.manager.getTask(task.name)?.impl;
					if(impl && impl.renderTab)
						return impl.renderTab(html, T);

					return html`
						<div style="display:flex;flex-direction:row;">
							<div style="font-size:18px;">${task.type}</div>
							<div style="font-size:10px; margin-top:8px;">${task.id}</div>
						</div>`;
				}
				//<div style="font-size:18px;"><flow-i18n>${task.type}</flow-i18n></div>
			});
		}
		
		this.taskTabs[key] = this.qS(`tab-content[for="${key}"]`);
		if(!this.taskTabs[key]){
			const template = document.createElement('template');
			template.innerHTML = 
			`<tab-content for="${key}" data-active-display="flex" class="advanced term">
				<flow-terminal noinput resident="2048" class="x-terminal" background="transparent" foreground="transparent"></flow-terminal>
				<!-- div class="tools">
					<flow-btn data-action="RUN">RUN</flow-btn>
					<flow-btn data-action="STOP">STOP</flow-btn>
					<flow-btn data-action="RESTART">RESTART</flow-btn>
					<flow-btn data-action="PURGE_DATA">PURGE DATA</flow-btn>
				</div -->
			</tab-content>`
			let tabContent = template.content.firstChild;
			// tabContent.querySelector(".tools").addEventListener('click', e=>{
			// 	this.onToolsClick(e);
			// });
			this.appendChild(tabContent);
			this.taskTabs[key] = tabContent;
			this.taskTerminals[key] = tabContent.querySelector("flow-terminal");
			dpc(512, () => {
				this.taskTerminals[key].registerLinkHandler?.(this.handleBrowserLink);
			})
		}
		

		caption.requestUpdate('tabs', lastValue)
	}
	removeTaskTab(task){
		const {key, name} = task;
		const {caption} = this;
		let newTabs = caption.tabs.filter(t=>t.id != key);
		//console.log("lastValue", caption.tabs.slice(0), newTabs.slice(0))
		let tabContent = this.taskTabs[key];
		if(tabContent && tabContent.parentNode)
			tabContent.parentNode.removeChild(tabContent);

		if(newTabs.length == caption.tabs.length)
			return;
		let lastValue = caption.cloneValue(caption.tabs);

		caption.tabs = newTabs;

		caption.requestUpdate('tabs', lastValue)
	}
	async saveModulesConfig(config){
		//console.log("saveModulesConfig:config", config)
		try{
			config = JSON.parse(config);
		}catch(e){
			return
		}
		let {config:daemons} = await this.get("set-modules-config", {config});
		console.log("updatedConfig", daemons)
		if(daemons)
			this.restartDaemons(daemons);
	}

	async setConfigTemplate(nc, network){
		//console.log("saveModulesConfig:config", config)
		let {config} = await this.get("set-config-template", {defaults : nc, network});
		console.log("Update Config From Template:", config)
		if(config && config.modules)
			this.restartDaemons(config.modules);
		return config;
	}

	onToolsClick(e){
		let $target = $(e.target).closest("[data-action]");
		let $tabContent = $target.closest("tab-content");
		let key = ($tabContent.attr("for")+"").replace(/\-/g, ":");
		let action = $target.attr("data-action");
		if(!action || !$tabContent.length)
			return

		console.log("onToolsClick:TODO", action, key)
	}

	async getModuleConfig() {
		let {config} = await this.get("get-modules-config");
		return config && config.daemons;
	}

	async initDaemons(daemons){
		if(!daemons){
			let {config} = await this.get("get-modules-config");
			if(!config)
				return "Could Not load modules."
			daemons = config;
			
		}
		
		this.showApps(daemons);
		
		console.log("initDaemons", daemons);
		this.manager.start(daemons);
	}

	refreshApps() {
		dpc(async () => {
			let { config } = await this.get("get-modules-config");
			this.showApps(config);		
		})
	}
	
	async restartDaemons(daemons){

		if(!daemons) {
			let {config} = await this.get("get-modules-config");
			daemons = config.daemons;
			console.log("restartDaemons - module config:", daemons);
		}

		try{
			await this.manager.stop();
			console.log("initDaemons....")
			dpc(1000, ()=>{
				this.initDaemons(daemons);
			});
		}catch(e){
			console.log("restartDaemons:error", e)
			dpc(1000, ()=>{
				this.initDaemons(daemons);
			});
		}
	}
	async stopDaemons(){
		if(!this.manager)
			return true;
		try{
			await this.manager.stop();
		}catch(e){
			console.log("manager.stop:error", e)
			return false;
		}
		return true;
	}

	cleanup() {
		if(this.statsd)
			delete this.statsd;
	}

	post(subject, data){
		this.rpc.dispatch(subject, data)
	}
	get(subject, data){
		return new Promise((resolve, reject)=>{
			this.rpc.dispatch(subject, data, (err, result)=>{
				this.debug && console.log("subject:err, result", subject, err, result)
				if(err)
					return resolve(err)

				resolve(result);
			})
		})
	}
	redraw() {
		this?.caption?.requestUpdate();
	}
	renderModuleInfo(task, info){
		this._infoTable = this._infoTable || document.querySelector("#process-info-table");
		this._taskInfo = this._taskInfo || {};
		
		this._taskInfo[task.key] = info;
		let list = Object.entries(this._taskInfo);
		render(repeat(list, ([k])=>k, ([k, info])=>info), this._infoTable);
	}
	exit(){
		this.runInBG = false;
		this.closeWin(true);
	}
	initWin(){
		const win = nw.Window.get();
		this.win = win;
		const minimize = win.minimize.bind(win);
		win.minimize = ()=>{
			if(this.runInBG){
				this.hideWin();
				return
			}

			minimize();
		}

		this.closeWin = async(isExit)=>{
			console.log("%c######## closeWin called ######", 'color:red')
			if(isExit !== true && !this.runInBG){
				let {btn} = await FlowDialog.show({
					title:i18n.t("EXIT KDX"),
					body:i18n.t("Are you sure?"),
					btns:[i18n.t('Cancel'), i18n.t('Exit')+':warning',
					{
						value : 'background',
						text : html`<span style="font-size:13.3px;">${i18n.t("Leave in the Background")}</style>`,
						cls : 'primary'						
					}]
				});
				if(btn == 'background') {
					this.setRunInBG(true);
					this.hideWin();
					return
				}
				else
				if(btn != 'exit')
					return
			}
			if(!this.onbeforeunload())
				return

			//this.setUiDisabled(true);
			dpc(500, ()=>{

				window.onbeforeunload = null;
				win.close(true);

				if(window.flow && window.flow['flow-window-link'].windows) {
					window.flow['flow-window-link'].windows.forEach((win)=>{
						try { win.close(); } catch(ex) {}
					});
				}

			})
		}

		win.on("close", ()=>this.closeWin());

		win.on("minimize", ()=>{
			if(this.showMenu)
				this.showMenu.enabled = true;
		})

		nw.App.on("reopen", ()=>{
			this.showWin();
		})

		this.onbeforeunload = ()=>{
			if(this.runInBG){
				this.hideWin();
				return false
			}

			this.stopDaemons();
			this.cleanup();
			if(this.tray){
				this.tray.remove();
				this.tray = null;
			}

			return true;
		}

		//window.onbeforeunload = this.onbeforeunload
	}
	hideWin(){
		//window.onbeforeunload = null;
		if(this.showMenu)
			this.showMenu.enabled = true;
		this.win.hide();
	}
	showWin(){
		if(this.showMenu)
			this.showMenu.enabled = false;
		this.win.show();
		//window.onbeforeunload = this.onbeforeunload
	}
	isDevMode() {
	    return (window.navigator.plugins.namedItem('Native Client') !== null);
	}
	resolveStrings(v){
		if(typeof v == "string")
			return this.manager.resolveStrings(v);
		if(utils.isArray(v)){
			return v.map(c=>{
				return this.resolveStrings(c)
			})
		}
		if(utils.isObject(v)){
			Object.entries(v).forEach(([k, c])=>{
				v[k] = this.resolveStrings(c)
			})
		}

		return v;

	}
	showApps(daemons) {

		const { qS } = this;
		let apps = qS("#applications");
		let appList = qS("#application-list");


		let cfgApps = Object.entries(daemons).map(([ident,v]) => {
			if(/^app:/i.test(ident) && !v.disable) {
				return { ident, ...v };
			} else
				return null;
		}).filter(v=>v).map((app) => {
			app = this.resolveStrings(app);
			let [,name] = app.ident.split(':');
			name = name || app.name || '???';
			let pkgFile;
			if(!app.folder){
				pkgFile = path.join(this.manager.appFolder, 'apps', name, 'package.json');
				app.folder = name;
			}else{
				pkgFile = path.join(app.folder,'package.json');
			}
			
			let pkg = { name, description : app.descr || app.description || app.folder };
			//console.log("pkgFile", pkgFile)
			if(fs.existsSync(pkgFile)) {
				try {
					pkg = JSON.parse(fs.readFileSync(pkgFile,'utf8'));
				} catch(ex) {
					console.log(ex);
				}

				//console.log("pkgpkgpkg", pkg)
			}

			let config =  Object.assign({
				name:pkg.name,
				description:pkg.description,
				folder:app.folder
			}, pkg.kdx||{})

			return this.resolveStrings(config);
		})


		let appsMap = { }

		this.manager.apps.forEach((app) => {
			appsMap[app.name] = Object.assign({}, app, appsMap[app.name] || {});
		})
		cfgApps.forEach((app) => {
			appsMap[app.name] = Object.assign({}, app, appsMap[app.name] || {});
		});



		let entries = Object.values(appsMap).map((app) => {
			app = this.resolveStrings(app);

			let ident = `app:${app.name}`;

			if(app.advanced && !this.advanced)
				return;

			let location = app.location;
			if(!location && app.engines?.kdx) {
				location = `apps/${app.folder}/${app.main}`;
			}

			let uid = Math.round(Math.random()*0xffffff).toString(16);
			const width = app.width || 1024;
			const height = app.height || 768;
			let key = ident.replace(/\W/g,'-');
			let disabled = '';
			if(!/\.html$/.test(app.location))
				disabled = true;
			return `${this.debugAppLinks?JSON.stringify(app)+"::"+location:""}
				<flow-window-link
					${disabled}
					url="${location}"
					id="${key}-${uid}"
					appid="${key}"
					title="${app.name}"
					width="${width}"
					height="${height}"
					icon="resources/images/kdx-icon.png"
					resizable
					frame
					>${`${app.name} - ${app.description}`}</flow-window-link><br/>
					`;
					//new_instance
		});

		appList.innerHTML = entries.join('');

		apps.style.display = entries.length ? 'flex' : 'none';

	}


	getBinaryFolder(){
		return path.join(this.appFolder, 'bin', utils.platform);
	}

	handleBrowserLink(event, href) {
		require('nw.gui').Shell.openExternal(href);
	}

	initStatsdServer(address,prefix_, notify = false) {
		if(this.statsd)
			delete this.statsd;

		let prefix = (prefix_||'').replace(/\$HOSTNAME/ig,os.hostname());
		if(prefix[prefix.length-1] != '.')
			prefix = prefix+'.';

		let [host,port] = (address||'').split(':');
		port = parseInt(port) || 8125;

		if(!host) {
			if(0 && notify) {
				$.notify({
					//title : 'DAGViz',
					text : 'Missing statsd host',
					className : 'yellow',
					autoHide : true,
					autoHideDelay : 2000
				});
			}
			
			return;
		}

		this.statsd = new StatsD({
			host, port, prefix
		})
	}

	sampler_sink(ident, value, date) {
		if(!this.statsd)
			return;

		if(isNaN(value)) {
			console.error('sampler_sink error:',ident,value,date);
			return;
		}

		this.statsd.gauge(ident,value);
	}
}

KDXApp.define("kdx-app")

console.log("global.manager ->", global.manager)
/*
window.addEventListener("WebComponentsReady", ()=>{
	let controller = new Controller();
	window.controller = controller;
	console.log("controller ->", controller);
})
*/

