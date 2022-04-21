module.exports = async (client, PG, Ascii) => {
	const table = new Ascii("Buttons Handler");
	const buttonsFolder = await PG(`${process.cwd()}/Buttons/**/*.js`);

	buttonsFolder.map(async (file) => {
		const buttonFile = require(file);
		if (!buttonFile.id) return;

		client.buttons.set(buttonFile.id, buttonFile);
		table.addRow(`${buttonFile.id}`, `🔷 LOADED`);
	});
	
	console.log(table.toString());
}