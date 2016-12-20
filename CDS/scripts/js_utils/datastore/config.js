const path = require('path');
const fs = require('fs');
const PropertiesReader = require('properties-reader');

class Config {
    constructor (configDirectory = '/etc/cds_backend/conf.d') {
        this.configDirectory = configDirectory;

        const baseConfig = this._getBaseConfig();

        this.config = fs.readdirSync(this.configDirectory)
            .filter(f => f.endsWith('.conf'))
            .reduce((properties, fileName) => {
                const filePath = path.join(this.configDirectory, fileName);
                const props = PropertiesReader(filePath).getAllProperties();
                return Object.assign({}, properties, props);
            }, baseConfig);
    }

    _getBaseConfig () {
        const conf = {};

        if (process && process.env) {
            if (process.env.cf_route_name) {
                conf.route_name = process.env.cf_route_name;
            }

            if (process.env.HOSTNAME) {
                conf.hostname = process.env.HOSTNAME;
            }

            if (process.env.OSTYPE) {
                conf.ostype = process.env.OSTYPE;
            }

            if (process.env.cf_media_file) {
                conf.cf_media_file = process.env.cf_media_file;
            }
        }

        return conf;
    }

    withDateConfig (date = new Date()) {
        return Object.assign({}, this.config, {
            'year': date.getFullYear(),
            'month': date.getMonth() + 1,
            'day': date.getDate(),
            'hour': date.getHours(),
            'min': date.getMinutes(),
            'sec': date.getSeconds()
        });
    }
}

module.exports = Config;
