import {NS} from "Bitburner";

export async function main(ns: NS) {
    await ns.weaken(<string>ns.args[0]);
}