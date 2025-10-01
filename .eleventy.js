const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");
const pluginSEO = require("eleventy-plugin-seo");
const sitemap = require("@quasibit/eleventy-plugin-sitemap");

module.exports = function(eleventyConfig) {
    // Add plugins
    eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
    
    eleventyConfig.addPlugin(pluginSEO, {
        title: "తెలుగు వార్తలు",
        description: "తాజా తెలుగు వార్తలు, బ్రేకింగ్ న్యూస్",
        url: "https://hello-snamy.github.io/tns2",
        author: "Telugu News Team",
        twitter: "telugunews",
        image: "/images/og-image.jpg"
    });

    eleventyConfig.addPlugin(sitemap, {
        sitemap: {
            hostname: "https://hello-snamy.github.io/tns2",
        },
    });

    // Pass through files
    eleventyConfig.addPassthroughCopy("src/images");
    eleventyConfig.addPassthroughCopy("src/css");
    eleventyConfig.addPassthroughCopy("admin");

    // Collections
    eleventyConfig.addCollection("news", function(collection) {
        return collection.getFilteredByGlob("src/_posts/*.md");
    });
    
    eleventyConfig.addCollection("latestNews", function(collectionApi) {
      return collectionApi.getFilteredByTag("news").reverse().slice(0, 6);
    });

    // Add custom filters
    eleventyConfig.addFilter("isoDate", function(date) {
        return date.toISOString().split('T')[0];
    });
    
    eleventyConfig.addFilter("readableDate", function(date) {
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('te-IN', options);
    });
    
    eleventyConfig.addFilter("truncate", function(str, length) {
        if (!str) return '';
        if (str.length <= length) return str;
        return str.substring(0, length) + '...';
    });    
    // Add this filter for absolute URLs
    eleventyConfig.addFilter("absoluteUrl", (url) => {
        const siteUrl = process.env.URL || "https://hello-snamy.github.io/tns2";
        return new URL(url, siteUrl).toString();
    });

    // Add url_encode filter
    eleventyConfig.addFilter("url_encode", (url) => {
        return encodeURIComponent(url);
    });

    
    // Add date filter to format dates
    eleventyConfig.addFilter("date", (date, formatString) => {
        return format(new Date(date), formatString || "dd MMM yyyy");
    });

    return {
        dir: {
            input: "src",
            output: "_site",
            includes: "_includes",
            layouts: "_layouts",
            data: "_data"
        },
        templateFormats: ["md", "njk", "html"],
        markdownTemplateEngine: "njk",
        htmlTemplateEngine: "njk",
        dataTemplateEngine: "njk"
    };
};
