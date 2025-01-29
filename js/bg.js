const fs = require('fs');
const path = require('path');
const { 
	PluginConfig, importUtil
} = require(path.join(path.dirname(eagle.plugin.path), 'utils', 'app.js'));

eagle.onPluginCreate((plugin) => {
	
	console.log('eagle.onPluginCreate');

	let pconfig = PluginConfig.get();

	if (!pconfig.pythonToEagle || pconfig.pythonToEagle !== eagle.plugin.path) {
		PluginConfig.set('pythonToEagle', eagle.plugin.path);
		PluginConfig.save();
	}

	if (plugin.manifest.devTools){
		createTestButtons();
	}
});

eagle.onPluginRun(() => {
	console.log('eagle.onPluginRun');
	
});

function checkPythonEnvironment() {
	const  PyEnv  = importUtil('pyenv');
	const status = fs.existsSync(PyEnv.pythonPath) ? '🟢' : '🔴';
	document.getElementById('python-environment').innerHTML = `Python Environment ${status}`;
	console.log('Python environment status:', status);
}



eagle.onPluginShow(() => {
	console.log('eagle.onPluginShow');
	checkPythonEnvironment()
});

eagle.onPluginHide(() => {
	console.log('eagle.onPluginHide');
});

document.getElementById('python-environment').addEventListener('click', () => {
	checkPythonEnvironment()
});

// automatically run checkPythonEnvironment every 30 seconds
setInterval(checkPythonEnvironment, 30000);


document.getElementById('config-json').addEventListener('click', () => {
    const configJsonPath = path.join(eagle.plugin.path, 'config.json');
	console.log(configJsonPath);
    if (fs.existsSync(configJsonPath)) {
        eagle.shell.openPath(configJsonPath);
    } else {
        console.error('config.json file does not exist.');
    }
});

document.getElementById('reset-env').addEventListener('click', async () => {
	let result = await eagle.dialog.showMessageBox({
		title: 'Reset Environment',
		message: 'Are you sure you want to reset the environment?',
		type: 'warning',
		buttons: ['Reset', 'Cancel']
	});
	if (result.response === 0) {
		const PyEnv = importUtil('pyenv');
		await PyEnv.resetEnv();
	} else {
		console.log('Reset environment cancelled.');
	}

});

document.getElementById('clear-build').addEventListener('click', async () => {
	let result = await eagle.dialog.showMessageBox({
		title: 'Clear Build Cache',
		message: 'Are you sure you want to clear the build cache?',
		type: 'warning',
		buttons: ['Clear', 'Cancel']
	});

	if (result.response === 0) {
		const PyEnv = importUtil('pyenv');
		await PyEnv.downloadBase();
	} else {
		console.log('Clear build cache cancelled.');
	}


});


function createTestButtons(){
	const placeholder = 'print("Hello, World!")';
	const pythonCodeInput = document.createElement('textarea');
	pythonCodeInput.id = 'python-code-input';
	pythonCodeInput.placeholder = placeholder;
	pythonCodeInput.style.width = '100%';
	pythonCodeInput.style.height = '50px';
	pythonCodeInput.style.backgroundColor = 'lightgray';

	document.body.appendChild(pythonCodeInput);

	const executePythonCodeButton = document.createElement('button');
	executePythonCodeButton.id = 'execute-python-code';
	executePythonCodeButton.textContent = 'Execute Python Code';
	document.body.appendChild(executePythonCodeButton);

	document.getElementById('execute-python-code').addEventListener('click', async () => {
		const Py = importUtil('py');
		const pythonCode = pythonCodeInput.value || placeholder;
		const result = await Py.runCode(pythonCode);
		console.log(result);

		await eagle.dialog.showMessageBox({
			title: 'Python Code Result',
			message: `out:\n${result.stdout}\nerr:\n${result.stderr}`,
			type: 'info',
			buttons: ['OK']
		});
	});

	const runTestPipInstallButton = document.createElement('button');
	runTestPipInstallButton.id = 'run-test-pip-install';
	runTestPipInstallButton.textContent = 'Install Numpy';
	document.body.appendChild(runTestPipInstallButton);

	document.getElementById('run-test-pip-install').addEventListener('click', async () => {
		const Py = importUtil('py');
		const result = await Py.pipInstall("numpy");
		

		let outputstr = "";
		outputstr += "====install result====\n";
		outputstr += result.stdout;
		outputstr += "\n====pip debug====\n";
		outputstr += result.stderr;


		const result2 = await Py.runCode("import numpy; print(numpy.__version__)");

		await eagle.dialog.showMessageBox({
			title: 'Numpy Version',
			message: outputstr + "\n====run result====\n" + result2.stdout,
			type: 'info',
			buttons: ['OK']
		});
	});

	
}
