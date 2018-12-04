import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/font-awesome/css/font-awesome.min.css';
import 'bootstrap';
import * as templates from './templates.ts';

/**
* Convenience method to fetch and decode JSON.
*/

/*
const fetchJSON = async (url, method = 'GET', expectedStatus = 200) => {
    try {
        const response = await fetch(url, { method, credentials: 'same-origin' });
        return response.json();
    } catch (error) {
        return { error };
    }
};

const showAlert = (message, type = 'danger') => {
    const alertsElement = document.body.querySelector('.app-alerts');
    const html = templates.alert({type, message});
    alertsElement.insertAdjacentHTML('beforeend', html);
}

const getBundles = async () => {
    const bundles = await fetchJSON('/api/list-bundles');
    return bundles;
};

const listBundles = bundles => {
    const mainElement = document.body.querySelector('.app-main');
    mainElement.innerHTML = 
        templates.addBundleForm() + templates.listBundles({bundles});
    console.log(mainElement.innerHTML);
    
    const form = mainElement.querySelector('form');
    form.addEventListener('submit', event => {
        event.preventDefault();
        const name = form.querySelector('input').value;
        addBundle(name);
    });

    const deleteButtons = mainElement.querySelectorAll('button.delete');
    for(let i = 0; i < deleteButtons.length; ++i){
        const deleteButton = deleteButtons[i];
        deleteButton.addEventListener('click', event => {
            deleteBundle(deleteButton.getAttribute('data-bundle-id'));
        });
    }
};

const addBundle = async (name) => {
    try{
        // list of bundles already created
        const bundles = await getBundles();

        // add the new
        const url = `/api/bundle?name=${encodeURIComponent(name)}`;
        const resBody = await fetchJSON(url, 'POST');
        console.log(resBody);

        //merge
        bundles.push({id: resBody._id, name});
        listBundles(bundles);

        showAlert(`Bundle "${name}" created!`, 'success');
    }
    catch(err){
        showAlert(err);
    }
};

const deleteBundle = async (bundleId) => {
    try{
        // total bundles
        const bundles = await getBundles();

        // get the idx of teh deleted bundle
        const idx = bundles.findIndex(bundle => bundle.id === bundleId )
        if(idx < 0)
            throw Error(`bundle ${bundleId} not found to delete`);

        // delete the bundle
        const url = `/api/bundle/${encodeURIComponent(bundleId)}`;
        const resBody = await fetchJSON(url, 'DELETE');

        // refresh the list
        const [deletedBundle] = bundles.splice(idx, 1);
        listBundles(bundles);

        showAlert(`To delete Bundle "${deletedBundle.name}": ${resBody.result}`, 'success');
    }
    catch(err){
        showAlert(err);
    }
};

const showPrivacyPolicy = () => {
    const mainElement = document.body.querySelector('.app-main');
    mainElement.innerHTML = templates.privacyPolicy();
};

const showView = async () => {
    const mainElement = document.body.querySelector('.app-main');
    const [view, ...params] = window.location.hash.split('/');
    switch(view){
        case '#welcome':
            const session = await fetchJSON('/api/session');
            mainElement.innerHTML = templates.welcome({ session });
            if (session.error) {
                showAlert(session.error);
            }
            break;
        case '#list-bundles':
            try{
                const bundles = await getBundles();
                listBundles(bundles);
            }
            catch(err){
                showAlert(err);
                window.location.hash = '#welcome';
            }
            break;
        case '#privacy-policy':
            showPrivacyPolicy();
            break;
        default:
            throw Error(`Unrecognized view: ${view}`);
    }
};
*/

// Page setup.
(async () => {
    document.body.innerHTML = templates.main();
    //window.addEventListener('hashchange', showView);
    //showView().catch(err => window.location.hash = '#welcome');
})();
