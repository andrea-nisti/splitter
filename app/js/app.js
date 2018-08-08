require("file-loader?name=../index.html!../index.html");
const Web3 = require("web3");
const Promise = require("bluebird");
const truffleContract = require("truffle-contract");
const $ = require("jquery");

//TOFIX
// Not to forget our built contract
const splitterJson = require("../../build/contracts/Splitter.json");

// Supports Mist, and other wallets that provide 'web3'.
if (typeof web3 !== 'undefined') {
    // Use the Mist/wallet/Metamask provider.
    window.web3 = new Web3(web3.currentProvider);
} else {
    // Your preferred fallback.
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545')); 
}

Promise.promisifyAll(web3.eth, { suffix: "Promise" });
Promise.promisifyAll(web3.version, { suffix: "Promise" });

//TOFIX
const Splitter = truffleContract(splitterJson);
Splitter.setProvider(web3.currentProvider);

// Bound Functions

// SPlitter
const splitAmount = function() {
    var receiver1 = $("#receiver1").val();
    var receiver2 = $("#receiver2").val();
    var etherValue = $("#split-ether").val();
    var instance;
   $("#status").html("Split funds transaction in progress");
   $("#split-funds").attr("disabled",true);
   $("#withdraw-funds").attr("disabled",true);
    return Splitter.deployed().then(inst => {
            instance = inst;
            return instance.splitAmount.sendTransaction(receiver1, receiver2, {
                from: window.account,
                value: web3.toWei(etherValue, "ether")
            });
        }).then(txHash => {
		$("#status").html("Transaction on the way " + txHash);
            const tryAgain = () => web3.eth.getTransactionReceiptPromise(txHash).then(receipt => receipt !== null ?
                receipt : Promise.delay(5000).then(tryAgain));
            return tryAgain();
        }).then(receipt => {
            if (parseInt(receipt.status) != 1) {
                console.error("Wrong status");
                console.error(receipt);
                $("#status").html("There was an error in the tx execution, status not 1");
            } else {
                // Format the event nicely.
                $("#status").html("Transfer executed");
            }
            // Make sure we update the UI.
            return web3.eth.getBalancePromise(window.account);
        }).then(balance => {
            balance = web3.fromWei(balance, "ether");
            $("#balance").html(balance.toString(10));
            $("#split-funds").attr("disabled",false);
            $("#withdraw-funds").attr("disabled",false);
            return instance.getBalance(window.account);
        }).catch(e => {
            $("#status").html(e.toString());
            console.error(e);
            $("#split-funds").attr("disabled",false);
            $("#withdraw-funds").attr("disabled",false);
        });

}

// withdraw
const withdraw = function() {
    var etherValue = $("#withdraw-ether").val();
    var instance;
    $("#split-funds").attr("disabled",true);
    $("#withdraw-funds").attr("disabled",true);
    $("#status").html("Withdraw funds transaction in progress");
    return Splitter.deployed().then(inst => {
            instance = inst;
            return instance.withdraw.sendTransaction(web3.toWei(etherValue,"ether"), {
                from: window.account});
        }).then(txHash => {
            console.log("tes", txHash);
            const tryAgain = () => web3.eth.getTransactionReceiptPromise(txHash).then(receipt => receipt !== null ?
                receipt : Promise.delay(1000).then(tryAgain));
            return tryAgain();
        }).then(receipt => {
            if (parseInt(receipt.status) != 1) {
                console.error("Wrong status");
                console.error(receipt);
                $("#status").html("There was an error in the tx execution, status not 1");
            } else {
                // Format the event nicely.
                $("#status").html("Transfer executed");
            }
            // Make sure we update the UI.
            return web3.eth.getBalancePromise(window.account);
        }).then(balance => {
            balance = web3.fromWei(balance, "ether");
            $("#balance").html(balance.toString(10));
            $("#split-funds").attr("disabled",false);
            $("#withdraw-funds").attr("disabled",false);
            return instance.getBalance(window.account);
        }).catch(e => {
            $("#status").html(e.toString());
            console.error(e);
            $("#split-funds").attr("disabled",false);
            $("#withdraw-funds").attr("disabled",false);
        });

}

// EVENT Listener web interface
window.addEventListener('load', function() {
    return web3.eth.getAccountsPromise()
        .then(accounts => {
            if (accounts.length == 0) {
                $("#balance").html("N/A");
                throw new Error("No account with which to transact");
            }
            window.account = accounts[0];
            console.log("Account:", window.account);
            return web3.version.getNetworkPromise();
        })
        .then(network => {
            console.log("Network:", network.toString(10));
            
            //return Splitter.deployed();
            return web3.eth.getBalancePromise(window.account);
        })
        //.then(deployed => deployed.getBalance.call(window.account)) 
        // Notice how the conversion to a string is done at the very last moment.
	    .then(balance => { balance = web3.fromWei(balance, "ether");
                           $("#balance").html(balance.toString(10));
        })
        // add buttons listener here below
        // We wire it when the system looks in order.
        .then(() => $("#split-funds").click(splitAmount))
	    .then(() => $("#withdraw-funds").click(withdraw))
        // Never let an error go unlogged.
        .catch(console.error);
});

