
function make_environment(env) {
    return new Proxy(env, {
        get(target, prop, receiver) {
            if (env[prop] !== undefined) {
                return env[prop].bind(env);
            }
            return (...args) => {
                throw new Error(`NOT IMPLEMENTED: ${prop} ${args}`);
            }
        }
    });
}
const Log = Object.freeze({
    MESSAGE: (message) => console.log(`SYSTEM | ${message}`),
    WARNING: (message) => console.warn(`WARNING | ${message}`),
    ERROR: (message) => console.error(`ERROR | ${message}`),
});

function create_cstr(buffer, address) {
    const len = (new Uint8Array(buffer, address)).indexOf(0);
    const str = new Uint8Array(buffer, address, len);
    return new TextDecoder().decode(str);
}

function log(level, message, ...args) {

    // TODO: Add support for passing strings into `args`
    Log.WARNING("Logging currently only supports numbers as variadic arguments. " +
        "If you pass a pointer (like a char*, say) it will print the memory address instead of failing")

    let lvl = level;
    let msg = message;
    const dbg_msg = msg;
    for (const arg of args) {
        if (!msg.includes("%")) {
            Log.ERROR(`Too many arguments provided for message.\nMessage: ${dbg_msg}\nArgs: ${args}`)
            break;
        }
        msg = msg.replace("%", arg)
    }

    if (msg.includes("%")) {
        Log.ERROR(`Not enough arguments provided for message\nMessage: ${dbg_msg}\nArgs: ${args}`)
        return;
    }

    switch (typeof lvl) {
        case "function":
            level(msg);
            break;
        case "string":
            Log[lvl](msg);
            break;
        default:
            Log.ERROR(`Unexpected type log level type: ${typeof level}`)
    }
}

class Slowking {

    #reset() {
        this.wasm = undefined;
    }

    constructor() {
        this.#reset();
    }

    async wakeUp(wasmPath) {

        this.wasm = await WebAssembly.instantiateStreaming(wasmPath,
            { env: make_environment(this) }
        );
        this.buffer = this.wasm.instance.exports.memory.buffer;

        console.log(`Loaded wasm module:`);
        console.log(this.wasm);
    }

    roll(sides) {
        return this.wasm.instance.exports.roll_die(sides);
    }

    randf() {
        return Math.random();
    }

    log(level, message, ...args) {

        let lvl = level;
        let msg = message; 
        if (typeof level === 'number') {
            lvl = create_cstr(this.buffer, level);
        }

        if (typeof message === 'number') {
            msg = create_cstr(this.buffer, message);
        }

        const argArray = msg.match(/%[^%]/g).map((val) => extract_va_arg(this.buffer, va_ptr, val));
        console.log(argArray);
        
        // log(lvl, msg, ...args);
    }
}

window.onload = async () => {
    const path = fetch("./main.wasm");
    let sk = new Slowking();
    await sk.wakeUp(path);

    const btn = document.querySelector(".roll");
    const form = document.querySelector(".entry");
    btn.addEventListener("click", () => {
        const n = sk.roll(6);
        console.log(n);
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = e.target.querySelector(".diceString");
        const diceString = input.value;
        input.value = "";
        console.log(diceString);

    })
};