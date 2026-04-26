import { gotScraping } from "got-scraping";
import metascraper from "metascraper";
import metascraperTitle from "metascraper-title";
import metascraperImage from "metascraper-image";
import shopping from "$lib/server/shopping";
import { env } from "$env/dynamic/private";

const scraper = metascraper([shopping(), metascraperTitle(), metascraperImage()]);

const determineProxy = (url: URL) => {
    if (url.protocol === "http:") return env.http_proxy || env.HTTP_PROXY;
    if (url.protocol === "https:") return env.https_proxy || env.HTTPS_PROXY;
    return undefined;
};

export const extractProductMetadata = async (targetUrl: URL, locales: string[] = ["en-US"]) => {
    const resp = await gotScraping({
        url: targetUrl,
        proxyUrl: determineProxy(targetUrl),
        headerGeneratorOptions: {
            devices: ["desktop"],
            locales
        }
    });

    const metadata = await scraper({ html: resp.body, url: resp.url });

    if (metadata.url === metadata.image) {
        metadata.url = targetUrl.toString();
    }

    return metadata;
};