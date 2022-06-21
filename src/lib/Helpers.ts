import {NS} from "Bitburner";

class ReadText {
    static readLines(ns: NS, file: string): string[] {
        return (ns.read(file) as string).split(/\r?\n/);
    }

    static readNonEmptyLines(ns: NS, file: string): string[] {
        return this.readLines(ns, file).filter(value => value.trim() != "");
    }
}

class DownloadFiles {
    static async getFileToHome(ns: NS, source: string, dest: string) {
        const logger = new TermLogger(ns);
        logger.info(`Downloading ${source} -> ${dest}`);

        if (!(await ns.wget(source, dest, "home"))) {
            logger.err(`\tFailed retrieving ${source} -> ${dest}`);
        }
    }
}

class TermLogger {
    static INFO_LITERAL = "INFO   >";
    static WARN_LITERAL = "WARN   >";
    static ERR_LITERAL = "ERROR  >";
    static TRACE_LITERAL = "TRACE  >";
    ns: NS;

    constructor(ns: NS) {
        this.ns = ns;
    }

    /**
     * Prints an info message to the terminal
     * @param msg
     * @param args
     */
    info(msg: string, ...args: string[]) {
        this.ns.tprintf(`${TermLogger.INFO_LITERAL} ${msg}`, ...args);
    }

    /**
     * Prints a warning message to the terminal
     * @param msg
     * @param args
     */
    warn(msg: string, ...args: string[]) {
        this.ns.tprintf(`${TermLogger.WARN_LITERAL} ${msg}`, ...args);
    }

    /**
     * Prints an error message to the terminal
     * @param msg
     * @param args
     */
    err(msg: string, ...args: string[]) {
        this.ns.tprintf(`${TermLogger.ERR_LITERAL} ${msg}`, ...args);
    }

    /**
     * Prints a log message to the terminal
     * @param msg
     * @param args
     */
    log(msg: string, ...args: string[]) {
        this.ns.tprintf(`${TermLogger.TRACE_LITERAL} ${msg}`, ...args);
    }
}

interface RepoSettings {
    baseUrl: string;
    manifestPath: string;
}

const repoSettings: RepoSettings = {
    baseUrl: "http://localhost:9182",
    manifestPath: "/resources/manifest.txt",
};

class RepoInit {
    ns: NS;
    logger: TermLogger;

    constructor(ns: NS, logger: TermLogger = new TermLogger(ns)) {
        this.ns = ns;
        this.logger = logger;
    }

    private static getSourceDestPair(line: string): { source: string; dest: string } | null {
        return line.startsWith("./")
            ? {
                source: `${repoSettings.baseUrl}${line.substring(1)}`,
                dest: line.substring(1),
            }
            : null;
    }

    async deleteAllScriptsNotRunning() {
        this.logger.info(`Deleting scripts`);
        let files = this.ns.ls("home", ".js");
        for (let file of files) {
            if (!this.ns.isRunning(file, "home")) {
                this.logger.info(`-> deleting ${file}`);
                this.ns.rm(file, "home");
            }
        }
    }

    async pullScripts() {
        await this.deleteAllScriptsNotRunning();
        await this.getManifest();
        await this.downloadAllFiles();
    }

    async getManifest() {
        const manifestUrl = `${repoSettings.baseUrl}${repoSettings.manifestPath}`;

        this.logger.info(`Getting manifest...`);

        await DownloadFiles.getFileToHome(
            this.ns,
            manifestUrl,
            repoSettings.manifestPath
        );
    }

    async downloadAllFiles() {
        const files = ReadText.readNonEmptyLines(
            this.ns,
            repoSettings.manifestPath
        );

        this.logger.info(`Contents of manifest:`);
        this.logger.info(`\t${files}`);

        for (let file of files) {
            const pair = RepoInit.getSourceDestPair(file);

            if (!pair) {
                this.logger.err(`Could not read line ${file}`);
            } else {
                await DownloadFiles.getFileToHome(this.ns, pair.source, pair.dest);
            }
        }
    }
}

export {ReadText, TermLogger, RepoInit, DownloadFiles};