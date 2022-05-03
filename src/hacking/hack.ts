import {NS} from "Bitburner";

export async function main(ns: NS) {
    await ns.hack(<string>ns.args[0]);
}