/**
 * Created by Diogo on 2018年8月10日10:59:14
 */

require(['vue', 'common', 'extend', 'apiData', 'dialog'], function (Vue, app, ext, api, dialog) {
    let WIN = window;
    let DOC = document;
    const HEIGTH = WIN.innerHeight > 0 ? WIN.innerHeight : DOC.documentElement.clientHeight;
    let imgArray = [];
    let themsg = app.getValue('msg') || app.getValue('result');
    let type = app.getValue('type') || 0;
    // TODO:  临时复制用
    let iso = app.getValue('o')
    if (iso) {
        document.addEventListener('WeixinJSBridgeReady', function onBridgeReady() {
            //通过下面这个API显示右上角按钮
            WeixinJSBridge.call('showOptionMenu');
        });

        document.body.innerHTML = "debugger模式 , 1111复制 URL(删除o=1参数) 到模拟器上打开,可进行111模拟器调式"
        return false
    }


  

    if (!themsg) {
        dialog.tipDialog('请确认参数');
        return false;
    }
    // ---
    let vm = new Vue({
        el: '#app',
        data: {
            screenH: HEIGTH,
            title: '微信登录',
            userinfo: "",
            activityId: "",
            process: 0 // 整体的进度
        },
        mounted: function () {
            console.log("object");
            vm = this;
            // console.log(encodeURIComponent(WIN.location.href));

            vm.userLoginRegister();

            console.log(imgArray);
        },
        methods: {

            /**
             * [userLoginRegister description]
             * @param  {[type]} )={                                 } [description]
             * @param  {[type]} getActivityInfo [description]
             * @return {[type]}                 [description]
             */
            userLoginRegister: () => {
                api.userLoginRegister(themsg, type, 2).done(res => {
                    if (res.code == 200) {
                        app.storeValue("wxLogin", JSON.stringify(res.data), 'local');

                        vm.userinfo = res.data;
                        vm.activityId = res.data.activityId;
                        // vm.getActivityInfo(res.data.token)
                        let eurl = app.getValue('url', 'session')
                        if (eurl) {
                            //  app.linkTo('index');
                            window.location.href = eurl;
                        } else {
                            app.linkTo('index');
                        }

                        // console.log(res);
                    } else {
                        res.msg && dialog.tipDialog(res.msg);
                    }
                });
            },

            goTolink: (url) => {
                return false;
            },
            loadingPic: () => {
                app.loadImage(imgArray, function (res) {
                    console.log(res);
                    let pross = (res / imgArray.length) * 100;
                    vm.process = pross.toFixed(0);

                    if (vm.process == 100) {
                        // that.isShowStart = true;
                        window.location.href = 'h5.html';
                        return false;
                    }
                }, function (err) {
                    console.log(err);
                });
            }
        }
    });
});