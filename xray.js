$(document).ready(function() {
    //Container for the component's app configuration
    var appConfig = {
      settings: {
              showEditPortfolio: true
          },
      components: {},
      labels: {}
    };
  
    var newAccessToken = null;
    var env = null;

   /** 
     * get environment
    */
   function getEnv() {
    if (window.location.hostname.indexOf('dev') > 0) {
        env = 'uat';
    } else {
        env = 'prod';
    }

    return env;
   }
    /*Here you will define the list of components you want to add to you application
      It is an array of objects that follows the next structure
      {
        name: 'ecComponentExample', //Component's name
        container: 'example-id-container', //Each component must have an individual container
        configurationUrl: 'http://config-example' //Url to get the component's congifuration
        initialDataParameter: 'portfolio' //Parameter's name (It is optional depending on each component)
        initialData: {} //Object with the parameter data necessary for each component (It is optional depending on each component)
      }
    */
      var ecComponents = {
          name: 'ecXray',
          container: 'xray-container',
          configurationUrl: 'https://quotespeed.morningstar.com/components/configurations/nuvn/xray/v1/config.json',
          configurationNamespace: 'nuvn.xray.v1',
          initialDataParameter: 'portfolio'
      };
      
      env = getEnv();
  
      // Get stored fund info '?FLAAX,Ticker,50|NHMRX,Ticker,50'
      function compileFundData() {
          var rawURLData = window.location.href.split('?')[1];
          if (rawURLData === undefined) { return null };
          var fundData = rawURLData.split('|');
  
          var convertedFundData = fundData.map(function(item, i) {
              var ticketItems = item.split(',');
              var ticketObj = { identifier: ticketItems[0], identifierType: ticketItems[1], weight: ticketItems[2] };
              return ticketObj;
          })
  
         return convertedFundData;
      }
  
      var tickerArr = compileFundData();
    
      function executeMorningstarLoader() {
          morningstar.loader.load({
              instid: 'DEFAULT',
              appConfig: appConfig,
              angularOptions: {
                bootstrap: true
              },
              apiTokens: {
                apiGatewayToken: newAccessToken
              },
              configurationNamespace: 'nuvn.xray.v1',
              environment: env
          }, function (appConfig) {

            var componentInstance = morningstar.initComponent(ecComponents.name, {
                container: document.getElementById(ecComponents.container)
                });
                //Place additional parameters if the component requires
                var params = {
                    portfolio: {
                        name: 'Portfolio Review From Nuveen',
                        totalValue: 10000,
                        currencyId: 'USD',
                        holdings: tickerArr,
                        benchmark: { // TODO: What should the benchmark be?
                            type: 'Standard',
                            holdings: [{
                                identifier: 'XIUSA04GS0',
                                identifierType: 'MSID',
                                weight: 100
                            }]
                        }
                    }
                };
                // Once Morningstar component instance is loaded, you can interact
                // with it by setting exposed parameters and other component data
                // In this case: feed the sample portfolio data to the component
                componentInstance.setParameter('portfolio', params.portfolio);

          });
      }
    
    function getWidth() {
        var w = $('#xray-container').width();
        var w2 = $("#ec-xray-container-xray-main-group-section-panel-tool-bar").width();
        $('#w').text(w + ', ' + w2);
    }
  
    executeMorningstarLoader();
    setTimeout(getWidth(), 2000);
  });
