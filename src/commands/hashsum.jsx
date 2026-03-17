/* eslint-disable react-refresh/only-export-components */
import Hex from "crypto-js/enc-hex";
import MD5 from "crypto-js/md5";
import SHA1 from "crypto-js/sha1";
import SHA256 from "crypto-js/sha256";
import SHA512 from "crypto-js/sha512";
import SHA3 from "crypto-js/sha3";

const ALGORITHMS = {
    md5sum: (value) => MD5(value).toString(Hex),
    sha1sum: (value) => SHA1(value).toString(Hex),
    sha256sum: (value) => SHA256(value).toString(Hex),
    sha3sum: (value) => SHA3(value, { outputLength: 512 }).toString(Hex),
    sha512sum: (value) => SHA512(value).toString(Hex)
};

/**
 * Calcule un hash sur une valeur texte fournie en argument.
 * Si le texte contient des espaces, il suffit de le passer sans guillemets.
 */
export const executeHashsum = (command, args) => {
    const input = args.join(" ").trim();
    if (!input) {
        return <span style={{ color: "#f00" }}>{command}: argument texte manquant</span>;
    }

    const resolver = ALGORITHMS[command];
    if (!resolver) {
        return <span style={{ color: "#f00" }}>{command}: algorithme non supporte</span>;
    }

    const digest = resolver(input);
    return <span>{digest}  -</span>;
};
