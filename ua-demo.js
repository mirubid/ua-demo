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
            if (!ko.unwrap(vm.GtmId)) { return;}
            var rx = new RegExp('\\{1}','g');
            var js = document.getElementById('ua-startup').text
                .replace('{0}', ko.unwrap(vm.GtmId))
                .replace(rx, ko.unwrap(vm.dataLayer));
            injectScript('script', js);            
            vm.uaInitialized(true);
            localStorage['gtm-id'] = ko.unwrap(vm.GtmId);
        },
        gtm: {
            impression: function () {

                var payload = {
                    'ecommerce': {
                        'currencyCode': 'USD',
                        'impressions': ko.utils.arrayMap(ko.toJS(ko.unwrap(vm.products)), function (v, i) { v.position = i; return v; })
                    }
                };
                customize(payload);
                push(payload);

            },
            clickProduct: function (product) {
                console.log('click', this, arguments);

                var payload = makePayload('click', {
                    'actionField': { 'list': 'Premium Lister' },      // Optional list property.
                    'products': [ko.toJS(product)]
                });
                payload.event = 'productClick';
                payload.eventCallback = function () {

                    product._clickCount(product._clickCount() + 1);

                    console.log('productClick callback');
                };

                push(payload);
            },
            productDetailView: function (product) {
                console.log('detail');
                var payload = makePayload('detail', {
                    'actionField': { 'list': 'Premium Lister' },      // Optional list property.
                    'products': [ko.toJS(product)]
                });
                push(payload);
            },
            addToCart: function (product) {
                console.log('addToCart');
                var payload = makePayload('add', {
                    'products': [ko.toJS(product)]
                });
                payload.event = 'addToCart';
                push(payload);
            },
            purchase: function () {
                console.log('purchase');
                var payload = makePayload('purchase', {
                    'actionField': { 'id': 'T' + Math.random(), 'affiliation': 'Online Store', 'revenue': '35.00', 'tax': '3.00', 'shipping': '0.00' },
                    'products': ko.toJS(ko.unwrap(vm.products))
                });

                push(payload);
            }
        },
        ga: {

        }
    };
    function push(payload) {
        var dl = window[ko.unwrap(vm.dataLayer)];
        console.log(payload);
        dl.push(payload);
    }
    function makePayload(eventName, eventData) {
        var data = {};
        data[eventName] = eventData;
        data.currencyCode = 'USD';

        return customize({
            'ecommerce': data
        });
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
    vm.products =ko.mapping.fromJS(products);
    ko.utils.arrayForEach(ko.unwrap(vm.products), function (v) { v._clickCount = ko.observable(0);});
    vm.custom = custom;
    window.vm = vm;
    console.log(vm);
    ko.applyBindings(vm);
})();