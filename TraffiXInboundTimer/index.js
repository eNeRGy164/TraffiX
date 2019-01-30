const teamNames = process.env["Teams"];

module.exports = async function (context, timer) {
    const teams = teamNames.split(",");
    
    var messages = [];
    
    teams.forEach(team => {
        const message = {
            name: team,
            direction: "inbound"
        };
        
        messages.push(JSON.stringify(message));
    });
    
    context.bindings.queue = messages;
};