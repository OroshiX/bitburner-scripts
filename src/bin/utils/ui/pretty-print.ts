// https://github.com/MatiasCardullo/JavaScripts-Bitburner/blob/main/lib/graph.js
import {allServers} from "/js/all-servers.js";
import {NS} from "Bitburner";

export const heavy = 1;
export const tripleDash = 4;
export const horizontal = "─"; // U+2500
export const vertical = "│"; // U+2502
export const upLeft = "┌";//U+250C
export const upRight = "┐";//U+2510
export const downLeft = "└";//U+2514
export const downRight = "┘";//U+2518
export const verticalLeft = "├";
export const verticalRight = "┤";
export const horizontalDown = "┴";
export const horizontalUp = "┬";
export const center = "┼";
export const upLeftCurve = "╭";
export const upRightCurve = "╮";
export const downLeftCurve = "╰";
export const downRightCurve = "╯";
export const block = "█";
export const rightBlock = "▐";
export const leftBlock = "▌";
export const downBlock = "▄";

//'╶', '╴'

/** @param {NS} ns */
export async function main(ns: NS) {
    ns.clearLog();
    //    ns.tprint(bar(0.455, 50, true))
    //    const box1 = box(null, null, "this,is a,box".split(','));
    //    const box2 = box(31, 4);
    //    const boxes = concatGraphs(box1, box2);
    //    const myTable = table([[1, 2, 3], [4, 5, 6], [6, 7, 8]], "all");
    //    ns.tprint(concatGraphs(myTable, boxes, ' '))
    //    ns.tprint(table(stringToMatrix(ns.read("/augments/augsPrice.txt")), "first"))
    let props: string[];
    if (ns.args.length > 0) {
        props = ns.args as string[];
    } else {
        props = [];
        const leftProps = Object.keys(allServers[0]).sort();
        await chooseProperty(props, leftProps, ns);
        while (await ns.prompt("Add more?", {type: "boolean"})) {
            await chooseProperty(props, leftProps, ns);
        }
    }
    const pretty = table(objectToTable(allServers, props));
    ns.tprint("\n" + pretty);
    ns.print("\n" + pretty);
    ns.tprint(`Next time you can run the command\n\trun ${ns.getScriptName()} ${props.join(" ")}`);
    //    ns.tprint(graphBar(10, [32, 10, 54, 63, 41, 5, 34, 35, 33, 45, 1, 1, 1, 1, 1, 1, 1]))
}

/** @param {Array<String>} available
 * @param {Array<String>} chosen
 * @param {NS} ns
 */
async function chooseProperty(chosen, available, ns) {
    const p = await ns.prompt("Select a property", {type: "select", choices: available});
    if (p !== undefined) {
        const i = available.indexOf(p);
        if (i !== -1) {
            available.splice(i, 1);
        }
        chosen[chosen.length] = p;
    }
}

/** @param {any[]} list
 * @param {string[]} properties
 */
function objectToTable(list: any[], properties: string[]) {
    const res: string[][] = [];
    res[0] = properties;
    for (let i = 1; i <= list.length; i++) {
        const row: any[] = [];
        const item = list[i - 1];
        for (let k = 0; k < properties.length; k++) {
            row[k] = item[properties[k]];
        }
        res[i] = row;
    }
    return res;
}

export function graphBar(v, array, max = 0, min = 1000000000000, sustractMin = false) {
    let line = "";
    let output = "";
    for (let i = 0; i < array.length; i++) {
        if (array[i] > max) {
            max = array[i];
        }
        if (array[i] < min) {
            min = array[i];
        }
    }
    let barHeight;
    for (let i = v; i > -1; i--) {
        for (let j = 0; j < array.length; j++) {
            barHeight = array[j] / max * v;
            if (barHeight > i)
                line += block;
            else if (barHeight + 0.5 > i)
                line += downBlock;
            else
                line += " ";
        }
        output += line;
        line = "\n";
    }
    return output;
}

export function fluctuation(h, v, array) {
    let max = 0;
    let min = 1000000000000;
    for (let j = 0; j < array.length; j++) {
        if (array[j][0] > max) {
            max = array[j][0];
        }
        if (array[j][0] < min) {
            min = array[j][0];
        }
    }

}

export function bar(value = 0, length = 100, reverse = false) {
    let aux = length * value;
    const array: string[] = [];
    let string: string;
    for (let j = 0; j < length; j++) {
        if (aux >= 1) {
            array.push(block);
            aux--;
        } else if (aux >= 1 / 2) {
            array.push(leftBlock);
            aux--;
        } else {
            array.push("-");
        }
    }
    string = array.toString();
    if (reverse)
        string = array.reverse().toString().replace(leftBlock, rightBlock);
    return string.replaceAll(",", "");
}

export function box(h = 0, v = 0, text = null, aline = "left") {
    let line = "";
    let textArray: any[] = [];
    if (text != null) {
        if (typeof (text) === "string")
            textArray.push(text);
        else
            textArray = text;
        if (v < textArray.length)
            v = textArray.length;
        for (let i = 0; i < v; i++) {
            try {
                if (h < textArray[i].length)
                    h = textArray[i].length;
            } catch {
            }
        }
    }

    line += lineHorizontal([upLeft, upRight], h) + "\n";
    for (let i = 0; i < v; i++) {
        line += vertical;
        let aux = "";
        if (text != null && textArray.length > i)
            aux += textArray[i];
        line += alignString(aux, h, aline) + vertical + "\n";
    }
    line += lineHorizontal([downLeft, downRight], h);

    return line;
}

export function table(matrix, horizontalSeparator = "", aline = "left") {
    let line = "";
    let all = false;
    const rows = matrix.length;
    const columns = matrix[0].length;
    const lengthPerColumn = new Array(columns).fill(0);
    let alinePerColumn;
    const separatorPerRow: number[] = [];
    let separator;
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            if (matrix[i][j].toString().length > lengthPerColumn[j]) {
                lengthPerColumn[j] = matrix[i][j].toString().length;
            }
        }
    }
    if (Array.isArray(aline)) {
        alinePerColumn = aline;
    } else {
        alinePerColumn = new Array(columns).fill(aline);
    }
    if (Array.isArray(horizontalSeparator)) {
        separator = horizontalSeparator;
    } else {
        separator = [horizontalSeparator];
    }
    for (let i = 0; i < separator.length; i++) {
        if (typeof (separator[i]) == "string")
            separator[i] = separator[i].toLowerCase();
        switch (separator[i]) {
            case "both":
                separatorPerRow.push(rows - 2);
            case "first":
                separatorPerRow.push(0);
                break;
            case "last":
                separatorPerRow.push(rows - 2);
                break;
            case "all":
                all = true;
                break;
            default:
                if (typeof (separator[i]) == "number") {
                    separatorPerRow.push(parseInt(separator[i]));
                    separatorPerRow.push(parseInt(separator[i]) + 1);
                }
                break;
        }
    }
    line += lineHorizontal([upLeft, upRight], lengthPerColumn, horizontalUp) + "\n";
    for (let i = 0; i < rows; i++) {
        line += vertical;
        for (let j = 0; j < matrix[i].length; j++) {
            line += alignString(matrix[i][j], lengthPerColumn[j], alinePerColumn[j]) + vertical;
        }
        line += "\n";
        if (i < rows - 1) {
            if (all || separatorPerRow.includes(i))
                line +=
                    lineHorizontal([verticalLeft, verticalRight], lengthPerColumn, center) + "\n";
        }
    }
    line += lineHorizontal([downLeft, downRight], lengthPerColumn, horizontalDown);

    return line;
}

export function lineHorizontal(char, h, char2: string | null = null) {
    //let debug = 1;
    let line = char[0];
    if (char2 == null) {
        //debug += h
        for (let i = 0; i < h; i++) {
            line += horizontal;
        }
    } else {
        for (let i = 0; i < h.length; i++) {
            //debug += h[i]
            for (let j = 0; j < h[i]; j++) {
                line += horizontal;
            }
            if (i < h.length - 1) {
                line += char2;// debug++;
            }
        }
    }
    line += char[1];//+debug+1;
    return line;
}

export function stringToMatrix(string: string, firstSplit = "\n", secondSplit = ",") {
    const matrix: string[][] = [];
    string.split(firstSplit).forEach((l) => matrix.push(l.split(secondSplit)));
    return matrix;
}

export function alignString(input, length, align) {
    let output = input.toString();
    switch (align/*.toLowerCase()*/) {
        case "right":
            output = output.padStart(length, " ");
            break;
        case "center":
            output = output.padStart(length / 2 + output.length / 2, " ");
        case "left":
            output = output.padEnd(length, " ");
            break;
    }
    return output;
}

export function concatGraphs(string1 = "", string2 = "", space = "") {
    let line = "";
    let output = "";
    const array1 = string1.split("\n");
    const array2 = string2.split("\n");
    const length1 = array1[0].length;
    const length2 = array2[0].length;
    let length = array1.length;
    if (array1.length < array2.length)
        length = array2.length;
    for (let i = 0; i < length; i++) {
        if (i < array1.length)
            line += array1[i];
        else
            line += "".padStart(length1, " ");

        line += space;

        if (i < array2.length)
            line += array2[i];
        else
            line += "".padStart(length2, " ");

        output += line;
        line = "\n";
    }
    return output;
}