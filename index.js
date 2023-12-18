import neatCsv from "neat-csv";
import fs from "fs/promises";
import path from "path"
import {pipe} from "ts-functional-pipe"
import { json2csv } from 'json-2-csv';

const WKBS = [
    "1080p",
    "780p",
    "720p",
    "WEBRip",
    "XViD",
    "MULTiPLY",
    "AC3",
    "EVO",
    "x264",
    "BRRip",
    "CC",
    "DVDRip",
    "iNTERNAL",
    "-MTN",
    "-DMT",
    "BluRay",
    "H264",
    "AAC-RARBG",
    "HQ",
    "MiNX",
    "x265",
    "10bit-GalaxyRG",
    "XviD",
    "FiNaLe",
    "INTERNAL",
    "BDRip",
    "AMZN" ,
    "GalaxyRG",
    "Mp4",
    "DD5",
    "Will1869",
    "WEB",
    "DL",
    "JYK",
    "NF",
    "HDCLUB",
    "DiMEPiECE",
    "LAMA",
    "MP4",
    "AAC",
    "H256",
    "HEVC",
    "BONE",
    "HD",
    "Mkvking",
    "GalaxyTV",
    "BRrip",
    "Sujaidr",
    "(pimprg)",
    "BONSAI",
    "2CH",
    "DSNP",
    "DDP",
    "PiRaTeS",
    "264"
]

const stripSquareBracketedTextFromString = (input) => input.replaceAll(/\[.+?\]/ig, "")

const trimSymbols = (input) => input.trim().replaceAll(/^[^a-zA-Z\d:\)]|[^a-zA-Z\d:\)]$/ig, "").trim()

const maybeExtractDateString = (input) => {
    const dateMatcher = () =>  /(\(?(?:19\d\d|20\d\d)\)?)/ig;
    const matches = [...input.matchAll(dateMatcher())];
    const dateString = matches[0] ? `(${matches[0][0].replaceAll(/\(|\)/ig, "")})` : "";
    return `${input.replaceAll(dateMatcher(), "").trim()} ${dateString}`
}

const stripWebsites = (input) => {
    return input.replaceAll(/(:?www\.)?.+\.(:?com|org|net)/g, "")
}

const removeWellKnownBadStrings = (input) => {
    const compiledWllKnownBadStrings = new RegExp(WKBS.join("|"), "g")
    return input.replaceAll(compiledWllKnownBadStrings, "")
}

const removeSymbols = (input) => input.replaceAll(/\.|\-/gi, " ");

const removeSizeStrings = (input) => input.replaceAll(/\d{1,100}MB/gi, "");

const normalizeSpaces = (input) => input.replaceAll(/\s{1,100}/gi, " ")

const finalTrim = (input) => input.trim()

const pipedCombinators = pipe(
    maybeExtractDateString,
    stripSquareBracketedTextFromString,
    stripWebsites,
    removeWellKnownBadStrings,
    removeSymbols,
    removeSizeStrings,
    trimSymbols,
    normalizeSpaces,
    finalTrim
)

const getParsedPathsFromDisk = async () => {
    const data = await fs.readFile("./data/movies.csv")
    const result = await neatCsv(data)
    const names = result.map(({Pathname}) => Pathname).filter(Boolean)

    return names.map((pathname) => ({
        pathname,
        basename: path.win32.basename(pathname)
    }))
}
const main = async () => {
    const parsedPaths = await getParsedPathsFromDisk();
    const results = parsedPaths.map(({pathname, basename}) => ({
        pathname,
        basename,
        parsed: pipedCombinators(basename)
    }))

    await fs.writeFile("./data/movies-cleaned.csv", json2csv(results))
}

main().catch(console.error)