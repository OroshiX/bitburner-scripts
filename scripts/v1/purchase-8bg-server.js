/** @param {NS} ns */
export async function main(ns) {
    // how much RAM each purchased server will have
    let ram = 8; // GB
    let i = 0;
    let target = ns.args[0];
    if (target == null) {
        var servers = ns.read("servers.txt").split("\n").map((e) => e.split(",")[0]);
        target = ns.prompt("Target server", servers);
    }
    var scriptName = ns.args[1];
    if (scriptName == null) {
        var files = ns.ls('home').filter((e) => e.endsWith(".js"));
        scriptName = ns.prompt("Script to execute?", files);
    }
    let cost = ns.getPurchasedServerCost(ram);
    ns.print("Cost for a server", cost);
    // Continuously try to purchase servers until we've reached the maximum amount of servers
    while (i < ns.getPurchasedServerLimit()) {
        // Check if we have enough money to purchase a server
        if (ns.getServerMoneyAvailable("home") > cost) {
            // 1. Purchase the server
            let hostname = ns.purchaseServer("pserv-" + i, ram);
            // 2. Copy the hacking script onto the newly purchased server
            await ns.scp(scriptName, hostname);
            // 3. Run our hacking script on the newly purchased server with 3 threads
            ns.exec(scriptName, hostname, 3, target, 0.75, 5);
            i++;
        } else {
            await ns.sleep(30000);
        }
    }
}