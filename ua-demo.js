(function () {
    window.dataLayer = [];
    var products=[{
        'name': 'Premium Lister',
        'id': '20000',
        'price': '50',
        'brand': 'LoopNet',
        'category': 'Listing Membership',
        'variant': 'Flexible PL',
        'list': 'Premium Lister',
        'position': 1,
        'quantity':1
    },
    {
        'name': 'Diamond & Platinum Listings',
        'id': '20001',
        'price': '75',
        'brand': 'LoopNet',
        'category': 'Pay per Listing Option',
        'variant': 'Diamond',
        'list': 'Diamond & Platinum Listings',
        'position': 2,
        'quantity':1
    }];
    var checkoutSteps = [
        { step: 1, name: 'Billing_Info' },
        { step: 2, name: 'CC_Info' },
        { step: 3, name: 'TC_Agreement' },
        { step: 4, name: 'Complete_Purchase' },
        { step: 5, name: 'Confirmation' }
    ];
    function guid() {
        function _p8(s) {
            var p = (Math.random().toString(16) + "000000000").substr(2, 8);
            return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
        }
        return _p8() + _p8(true) + _p8(true) + _p8();
    }

    var uid = Math.floor((Math.random() * 1000000) + 1);
    var GUID = guid();
    var custom = [{ name: 'shoppingSessionKey', value: 'AID:' + uid + '-$$-' + GUID },
        { name: 'salesChannel', value: 'TEST' }
    ];
    var vm = {
        GtmId: ko.observable(localStorage['gtm-id'] || ''),
        uid: ko.pureComputed({
            read:function(){return localStorage['uid'] || ''},
            write: function (newValue) {
                if (!newValue) { localStorage.removeItem('uid');return; }
                localStorage['uid'] = newValue;
                dataLayer.push({ 'uid': newValue });
                vm.gtm.inc();
            }
        }),
        dataLayer:'dataLayer',
        uaInitialized: ko.observable(false),
        initGtm: function () {            
            if (!ko.unwrap(vm.GtmId)) { return; }
            customize(vm.gtm.payload);
            var rx = new RegExp('\\{1}','g');
            var js = document.getElementById('ua-startup').text
                .replace('{0}', ko.unwrap(vm.GtmId))
                .replace(rx, ko.unwrap(vm.dataLayer));
            injectScript('script', js);            
            vm.uaInitialized(true);
            localStorage['gtm-id'] = ko.unwrap(vm.GtmId);
        },
        
        ga: {

        }
    };
    function dl() {
        return window[ko.unwrap(vm.dataLayer)];
    }

    function customize(payload) {
        ko.utils.arrayForEach(ko.unwrap(vm.custom), function (v, i) { payload[v.name] = v.value; });
        return payload;
    }
    function injectScript(s, text) {
        console.log(text);
        var el = document.createElement(s);
        el.innerHTML = text;
        var f = document.getElementsByTagName(s)[0];
        f.parentNode.insertBefore(el, f)
    }
    function gtmAction(name) {        
        if (!vm.gtm.payload[name]) {
            vm.gtm.payload[name] = { products: [] };
        }
    }
    function gtmEcomEvent(eventName,ecomName,products,callback) {
        var d = { event: eventName, ecommerce: {} };
        d.ecommerce[ecomName] = { products: products, actionField: {} };
        
        d.eventCallback = function () {
            
            vm.gtm.inc();
            //console.log(arguments, this);(none,window)
            if (typeof (callback) === 'function') { callback(); }

        }
        return d;
    }
    
    vm.gtm = {
        txnId: ko.observable(guid()),
        revenue: ko.observable('100'),
        payload: { eventCallback: function () { console.log('payload eventCallback'); }},
        impression: function () {
            var d = {
                event:'ecom_impression',
                ecommerce: {
                impressions: ko.utils.arrayMap(ko.toJS(ko.unwrap(vm.products)), function (v, i) { v.position = i; return v; })
            }};
            //vm.gtm.payload.impressions = ko.utils.arrayMap(ko.toJS(ko.unwrap(vm.products)), function (v, i) { v.position = i; return v; });
            dataLayer.push(d);
            
            vm.gtm.inc();
        },
        clickProduct: function (product) {
            dataLayer.push(gtmEcomEvent('ecom_productClick', 'click', [ko.toJS(product)]));
        },
        productDetailView: function (product) {            
            dataLayer.push(gtmEcomEvent('ecom_productDetailView','detail',[ko.toJS(product)]));            
            
        },
        addToCart: function (product) {
            
            dataLayer.push(gtmEcomEvent('ecom_addToCart', 'add', [ko.toJS(product)]));

        },
        checkout:function(co_step){
            var event = gtmEcomEvent('ecom_checkout_'+co_step.name, 'checkout', ko.toJS(ko.unwrap(vm.products)));
            event.ecommerce.checkout.actionField={step:co_step.step}
            dataLayer.push(event);
        },
        purchase: function () {
            var event = gtmEcomEvent('ecom_purchase', 'purchase', ko.toJS(ko.unwrap(vm.products)));
            event.ecommerce.purchase.actionField = { 'id': vm.gtm.txnId(), 'revenue': vm.gtm.revenue(), tax: '0', shipping: '0' };
            dataLayer.push(event);
        },
        inc: function () { vm.gtm.count(vm.gtm.count()+1); },
        count: ko.observable(0),
        setCustom: function () {
            dataLayer.push(customize({}));
            vm.gtm.inc();
        }
    };
    if (vm.uid()) {
        dataLayer.push({ 'uid': vm.uid() });
    }
    vm.dataLayerJson = ko.computed(function () {
        var c = vm.gtm.count();// just to make this update when something changes
        return ko.utils.arrayMap( dataLayer,function(v){return JSON.stringify(v);});
    });
    vm.products = ko.mapping.fromJS(products);
    vm.checkoutSteps = checkoutSteps;
    ko.utils.arrayForEach(ko.unwrap(vm.products), function (v) { v._clickCount = ko.observable(0);});
    vm.custom = custom;
    ko.applyBindings(vm);

})();