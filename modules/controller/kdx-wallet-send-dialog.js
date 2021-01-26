import {html, css, Dialog, askForPassword, KSP} from './dialog.js';
const pass = "Asd123###";

class KDXWalletSendDialog extends Dialog{
	static get styles(){
		return [Dialog.styles, 
		css`
			.container{
				max-height:710px;
				--flow-input-label-font-size: 0.9rem;
				--flow-input-label-padding: 5px 7px;
				--flow-input-font-family: 'Consolas';
				--flow-input-font-size:14px;
				--flow-input-font-weight: normal;
				--flow-input-height:50px;
				--flow-input-margin: 20px 0px;
				--flow-input-padding: 10px 10px 10px 16px;
			
			}
			.buttons{justify-content:flex-end}
			.estimate-tx-error{color:red}
			.estimate-tx span{display:block}
				
		`]
	}
	renderHeading(){
		return 'SEND';
	}
	renderBody(){
		return html`
			<!--div class="sub-heading">Send funds
			to: kaspatest:qrhefqj5c80m59d9cdx4ssxw96vguvn9fgy6yc0qtd
			</div-->
			<flow-input class="address full-width" outer-border
				label="Recipient Address" value="kaspatest:qrhefqj5c80m59d9cdx4ssxw96vguvn9fgy6yc0qtd"
				placeholder="kaspatest:qrjtaaaryx3ngg48p888e52fd6e7u4epjvh46p7rqz">
			</flow-input>
			<flow-input class="amount full-width" outer-border
				label="Amount in KSP" value="0.00000001" @keyup=${this.onAmountChange}
				placeholder="1">
			</flow-input>
			<flow-input class="fee full-width" label="Priority Fee"></flow-input>
			<flow-checkbox class="calculate-network-fee"
				@changed="${this.onNetworkFeeChange}">Automatically Calculate Network fee</flow-checkbox>
			<!--flow-input class="maximum-fee full-width" label="Maximum network fee"></flow-input-->
			<flow-checkbox class="inclusive-fee"
				@changed="${this.onInclusiveFeeChange}">Inclusive fee</flow-checkbox>
			<flow-input class="note full-width" outer-border label="Note">
			</flow-input>
			${this.renderEstimate()}
			<div class="error">${this.errorMessage}</div>`;
	}
	renderEstimate(){
		if(this.estimatedTxError)
			return html`<div class="estimate-tx-error">${this.estimatedTxError}</div>`;
		let {dataFee, fee, totalAmount, txSize} = this.estimatedTx;
		return html`<div class="estimate-tx">
			${txSize?html`<span class="tx-size">Transaction size: ${txSize.toFileSize()}<span>`:''}
			${dataFee?html`<span class="tx-data-fee">Data fee: ${KSP(dataFee)} KSP<span>`:''}
			${fee?html`<span class="tx-fee">Total fee: ${KSP(fee)} KSP<span>`:''}
			${totalAmount?html`<span class="tx-total">Total: ${KSP(totalAmount)} KSP<span>`:''}
		</div>`
	}
	renderButtons(){
		return html`
			<flow-btn @click="${this.cancel}">Cancel</flow-btn>
			<flow-btn primary @click="${this.sendAfterConfirming}">SEND</flow-btn>`
	}
	open(args, callback){
		this.callback = callback;
		this.args = args;
		this.wallet = args.wallet;
		this.estimatedTxError = "";
		this.estimatedTx = {};
		this.show();
	}
	cleanUpForm(){
		this.qSAll("flow-input").forEach(input=>{
    		input.value = "";
    	})
	}
    cancel(){
    	this.cleanUpForm();
    	this.hide();
    }
    getFormData(){
    	let address = this.qS(".address").value;
    	let amount = this.qS(".amount").value;
    	let note = this.qS(".note").value;
    	let fee = this.qS(".fee").value;
    	let calculateNetworkFee = !!this.qS(".calculate-network-fee").checked;
    	let inclusiveFee = !!this.qS(".inclusive-fee").checked;
    	/*
    	let networkFeeMax = this.qS(".maximum-fee").value;
    	if(networkFeeMax && fee && fee>networkFeeMax){
    		this.setError("Invalid fee")
    		return
    	}
    	*/

    	return {
    		address, amount, note, 
    		fee, calculateNetworkFee,
    		inclusiveFee
    	};
    }
    onInclusiveFeeChange(){
    	this.estimateTx();
    }
    onNetworkFeeChange(){
    	this.estimateTx();
    }
    onAmountChange(){
    	this.estimateTx();
    }
	async estimateTx(){
    	const formData = this.getFormData();
    	if(!formData)
    		return

    	let {error, data} = await this.wallet.estimateTx(formData);
    	console.log("estimateTx:error:", error, "data:", data)
    	this.estimatedTxError = error;
    	if(data){
    		this.estimatedTx = data;
    	}else{
    		this.estimatedTx = {};
    	}
    	this.requestUpdate("estimatedTx", null)
    }
    sendAfterConfirming(){
    	const data = this.getFormData();
    	if(!data)
    		return
    	console.log("data", data)
    	askForPassword({confirmBtnText:"CONFIRM SEND", pass}, ({btn, password})=>{
    		console.log("btn, password", btn, password)
    		if(btn!="confirm")
    			return
			data.password = password;
			this.hide();
			this.callback(data);
    	})
    }
}

KDXWalletSendDialog.define("kdx-wallet-send-dialog");