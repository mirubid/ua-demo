(function () {
    window.dataLayer = [];
    var products=[{
        'name': 'Premium Lister',
        'id': '20000',
        'price': '',
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
        'price': '',
        'brand': 'LoopNet',
        'category': 'Pay per Listing Option',
        'variant': 'Diamond',
        'list': 'Diamond & Platinum Listings',
        'position': 2,
        'quantity':1
    }];
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
        { name: 'salesChannel', value: 'ECOM' }
    ];
    var vm = {
        GtmId: ko.observable(localStorage['gtm-id'] || ''),
        dataLayer:'dataLayer',
        uaInitialized: ko.observable(false),
        initGtm: function () {
            console.log('initGtm');
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
        console.log('action+=' + name);
        if (!vm.gtm.payload[name]) {
            vm.gtm.payload[name] = { products: [] };
        }
    }
    vm.gtm = {
        payload: { eventCallback: function () { console.log('payload eventCallback'); }},
        impression: function () {

            vm.gtm.payload.impressions = ko.utils.arrayMap(ko.toJS(ko.unwrap(vm.products)), function (v, i) { v.position = i; return v; });

            vm.gtm.inc();
        },
        clickProduct: function (product) {
            
            gtmAction('click');

            vm.gtm.payload.click.products.push(ko.toJS(product));

            dataLayer.push({ 'event': 'productClick' });
            vm.gtm.inc();
        },
        productDetailView: function (product) {
            
            gtmAction('detail');
            vm.gtm.payload.detail.products.push(ko.toJS(product));
            vm.gtm.inc();
        },
        addToCart: function (product) {
            
            gtmAction('add');            

            vm.gtm.payload.add.products.push(ko.toJS(product));
            dataLayer.push({ 'event': 'addToCart' });
            vm.gtm.inc();
        },
        checkout:function(){
            gtmAction('checkout');
            vm.gtm.payload.checkout.products = ko.toJS(ko.unwrap(vm.products))
            vm.gtm.inc();
        },
        purchase: function () {
            gtmAction('purchase');

            vm.gtm.payload.purchase.products = ko.toJS(ko.unwrap(vm.products))
            vm.gtm.inc();
        },
        inc: function () { vm.gtm.count(vm.gtm.count()+1); },
        count: ko.observable(0)
    };
    vm.dataLayerJson = ko.computed(function () {
        var c = vm.gtm.count();// just to make this update when something changes
        return ko.utils.arrayMap( dataLayer,function(v){return JSON.stringify(v);});
    });
    vm.products =ko.mapping.fromJS(products);
    ko.utils.arrayForEach(ko.unwrap(vm.products), function (v) { v._clickCount = ko.observable(0);});
    vm.custom = custom;
    window.vm = vm;
    console.log(vm);
    dataLayer.push({ "ecommerce": vm.gtm.payload });
    ko.applyBindings(vm);

})();