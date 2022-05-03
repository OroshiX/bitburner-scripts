import {NS} from "Bitburner";

export async function main(ns: NS) {
    await ns.grow(<string>ns.args[0]);
}