import * as path from "path";
import * as glob from "glob";
import { config, CLI } from "./../../index";
import { utils } from "../../modules/utils";

export class Help extends CLI {
  constructor() {
    super();
    this.name = "help";
    this.description = "get actionhero CLI help; will display this document";
  }

  async run() {
    let files = [];
    const methods = {};

    // CLI commands included with ActionHero
    console.log();
    if (config.general.cliIncludeInternal !== false) {
      glob.sync(path.join(__dirname, "**", "**/*(*.js|*.ts)")).forEach(f => {
        files.push(f);
      });
    }

    // CLI commands included in this project
    config.general.paths.cli.forEach(cliPath => {
      glob.sync(path.join(cliPath, "**", "*(*.js|*.ts)")).forEach(f => {
        files.push(f);
      });
    });

    // CLI commands from plugins
    Object.keys(config.plugins).forEach(pluginName => {
      const plugin = config.plugins[pluginName];
      if (plugin.cli !== false) {
        glob.sync(path.join(plugin.path, "bin", "**", "*.js")).forEach(f => {
          files.push(f);
        });

        glob
          .sync(path.join(plugin.path, "dist", "bin", "**", "*.js"))
          .forEach(f => {
            files.push(f);
          });
      }
    });

    files = utils.arrayUniqueify(files);

    files.forEach(f => {
      try {
        const ExportedClasses = require(f);
        const req = new ExportedClasses[Object.keys(ExportedClasses)[0]]();
        if (
          req.name &&
          req.name !== "%%name%%" &&
          req.description &&
          typeof req.run === "function"
        ) {
          if (methods[req.name]) {
            throw new Error(`${req.name} is already defined`);
          }
          methods[req.name] = req;
        }
      } catch (e) {}
    });

    const methodNames = Object.keys(methods).sort();

    console.log(
      "ActionHero - The reusable, scalable, and quick node.js API server for stateless and stateful applications"
    );
    console.log("Learn more @ www.actionherojs.com");
    console.log("");
    console.log("CLI Commands:\r\n");
    methodNames.forEach(methodName => {
      console.log(`* ${methodName}`);
    });

    methodNames.forEach(methodName => {
      const m = methods[methodName];
      this.highlightWord(`actionhero ${m.name}`);
      console.log(`description: ${m.description}`);

      if (m.example) {
        console.log(`example: ${m.example}`);
      }

      if (!m.inputs) {
        m.inputs = {};
      }
      if (Object.keys(m.inputs).length > 0) {
        console.log("inputs:");
        Object.keys(m.inputs).forEach(inputName => {
          const i = m.inputs[inputName];
          console.log(`  [${inputName}] ${i.required ? "" : "(optional)"}`);
          if (i.note) {
            console.log(`    note: ${i.note}`);
          }
          if (i.default) {
            console.log(`    default: ${i.default}`);
          }
        });
      }
    });

    console.log("");

    return true;
  }

  highlightWord(word) {
    let lines;
    console.log("\r\n");
    lines = "";
    for (let i = 0; i < word.length; i++) {
      lines += "₋";
    }
    console.log(lines);
    console.log(word);
    lines = "";
    for (let i = 0; i < word.length; i++) {
      lines += "⁻";
    }
    console.log(lines);
  }
}
