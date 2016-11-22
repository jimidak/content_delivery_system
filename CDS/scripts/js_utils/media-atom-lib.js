var Promise = require('promise');
var datastore = require('./Datastore');
var HMACRequest = require('./HMACRequest');

const urlBase = process.env.url_base;
const assetPath = '/api2/atoms/:id/assets';
const metadataPath = '/api2/atoms/:id'
const activeAssetPath = '/api2/atom/:id/asset-active';
const youtubePrefix = 'https://www.youtube.com/watch?v='

function checkExistenceAndSubstitute(connection, variables) {
    const missingIndex = variables.findIndex(variable => {
        return !variable.value && variable.error;
    });

    if (missingIndex !== -1) {
        return new Promise((fulfill, reject) => {
            reject(new Error(variables[missingIndex].error));
        });
    }

    return datastore.substituteStrings(connection,
        variables.reduce((substitutions, variable) => {
          if (variable.value) {
            substitutions.push(variable.value);
          }
          return substitutions;
        }, [])
    );
};


function fetchMetadata(connection) {

    const environmentVariables = [{value: process.env.url_base, error: 'Cannot add assets to media atom: missing url base'}, {value: process.env.atom_id, error: 'Cannot add assets to media atom: missing atom id'}];

    let urlBase, atomId;
    return checkExistenceAndSubstitute(connection, environmentVariables)
    .then(substitutedStrings => {
        [urlBase, atomId] = substitutedStrings;

        const date = (new Date()).toUTCString();
        const uri = metadataPath.replace(/:id/, atomId);
<<<<<<< b66ffd61044db05f8f54288cf54fb38023845868
        const url = urlBase + uri;

        return hmac.makeHMACToken(connection, date, uri)
        .then(token => {
            return reqwest({
                url: url,
                method: 'GET',
                contentType: 'application/json',
                headers: {
                    'X-Gu-Tools-HMAC-Date': date,
                    'X-Gu-Tools-HMAC-Token': token,
                    'X-Gu-Tools-Service-Name': 'content_delivery_system'
                }
            })
            .then(response => {

                const title = response.title;
                const description = response.description;
                const categoryId = response.youtubeCategoryId;
                const channelId = response.channelId

                return Promise.all([
                  datastore.set(connection, 'meta', 'atom_title', title),
                  datastore.set(connection, 'meta', 'atom_description', description),
                  datastore.set(connection, 'meta', 'atom_channel_id', channelId),
                  datastore.set(connection, 'meta', 'atom_category', categoryId)
                ])

                .then(() => {
                    return response;
                });
=======

        .then(response => {
            const title = response.data.title;
            const description = response.data.description;
            const categoryId = response.data.categoryId;

            return Promise.all([datastore.set(connection, 'meta', 'atom_title', title), datastore.set(connection, 'meta', 'atom_description', description), datastore.set(connection, 'meta', 'atom_category', categoryId)])
            .then(() => {
                return response;
>>>>>>> add functions for active asset
            });
        });
    });
};

function makeAssetActive(connection) {

  counter = 1;

  const environmentVariables = [{value: process.env.url_base, error: 'Cannot add assets to media atom: missing url base'}, {value: process.env.atom_id, error: 'Cannot add assets to media atom: missing atom id'}];

  let atomId, youtubeId, urlBase;

  return Promise.all([checkExistenceAndSubstitute(connection, environmentVariables), datastore.get(connection, 'meta', 'youtube_id')])
  .then(results => {

    [urlBase, atomId] = results[0];
    youtubeId = results[1].value;

    const date = (new Date()).toUTCString();
    const data = { id: youtubeId };
    const uri = activeAssetPath.replace(/:id/, atomId);

    function makeActive() {

      return HMACRequest.makeRequest(connection, date, uri, urlBase, 'POST', data)
      .then(response => {
        console.log('returned response was ', response);
        if (response.status === 'DONE') {
          return response;
        }

        return this.setPollingInterval(counter)
        .then(() => {
          counter++;
          return makeActive.bind(this)();
        });

      });
    }

    return makeActive.bind(this)();
  });
};

function setPollingInterval(counter) {

    const INTERVAL = 210000;
    const MAX_TRIES = 10;

    if (counter > MAX_TRIES) {
      return new Promise((fulfill, reject) => {
        reject(new Error('Cannot add asset to youtube, video encoding took too long'));
      });
    }
    return new Promise(fulfill => {
      setTimeout(fulfill, INTERVAL)
    });
}

function postAsset(connection) {

    const environmentVariables = [
      {value: process.env.url_base, error: 'Cannot add assets to media atom: missing url base'},
      {value: process.env.atom_id, error: 'Cannot add assets to media atom: missing atom id'},
      {value: process.env.asset_url, error: null}
    ];

    let urlBase, atomId, assetBase;

    return checkExistenceAndSubstitute(connection, environmentVariables)
    .then(substitutedStrings => {

        if (substitutedStrings.length === 2) {
          [urlBase, atomId] = substitutedStrings;
          assetBase = youtubePrefix;
        } else if (substitutedStrings.length === 3) {
          [urlBase, atomId, assetBase] = substitutedStrings;
        }

        return datastore.get(connection, 'meta', 'youtube_id')
        .then(result => {
            const date = (new Date()).toUTCString();

            const youtubeUrl = assetBase + result.value;

            const data = { uri: youtubeUrl };
            const uri = assetPath.replace(/:id/, atomId);

            return HMACRequest.makeRequest(connection, date, uri, urlBase, 'PUT', data)

        });
    });
}

module.exports = {
    postAsset: postAsset,
    fetchMetadata: fetchMetadata,
    makeAssetActive: makeAssetActive,
    setPollingInterval: setPollingInterval
};
