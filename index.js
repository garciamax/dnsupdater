require('dotenv').config();
const DigitalOcean = require('do-wrapper').default;
const {API_TOKEN, DOMAIN, SUB_DOMAIN} = process.env;

const api = new DigitalOcean(API_TOKEN, 20);
const { exec } = require('child_process');
const icanhaz = () => {
    return new Promise(resolve => {
        exec('curl http://icanhazip.com/', (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
            resolve(stdout.trim())
        });

    })
};
const main = async () => {
    const public_ip = await icanhaz();
    const {body:{domain_records}} = await api.domainRecordsGetAll(DOMAIN,{});
    const {id, data} = domain_records.find(record => record.name === SUB_DOMAIN);
    if(public_ip === data) {
        console.log('No change');
        return;
    };
    const {body:{domain_record}} = await api.domainRecordsUpdate(DOMAIN, id, {data: public_ip});
    if(domain_record) console.log(`Updated to: ${domain_record.data}`)
}
(async () => {
    setInterval(main, 5*60*1000);
    await main();
})().catch(e => setImmediate(() => { throw e }));
