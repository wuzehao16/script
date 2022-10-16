/*
 福田智慧门禁

[task_local]
1 1 1 1 1 https://raw.githubusercontent.com/wuzehao16/script/main/qx/door.js, tag=福田智慧门禁, enabled=true

*/

// 新建一个实例对象, 把兼容函数定义到$中, 以便统一调用
let $ = new nobyda();

// 读取哔哩哔哩漫画签到脚本所使用的Cookie
let cookie = $.read("CookieBM");


// 预留的空对象, 便于函数之间读取数据
let user = {};

(async function () {
  // 立即运行的匿名异步函数
  // 使用await关键字声明, 表示以同步方式执行异步函数, 可以简单理解为顺序执行
  await openDoor(); //上面的查询都完成后, 则执行抢购
  $.done(); //抢购完成后调用Surge、QX内部特有的函数, 用于退出脚本执行
})();

function openDoor() {
  const RequestBody = {
    gate_uid: "CBCF059718A0EF120B9D014B2680F3A0",
  };
  const listUrl = {
    //查询商品接口
    url: "https://smartims-api.heyzhima.com/api/v2/gate/open",
    headers: {},
    body: RequestBody
  };
  return new Promise((resolve) => {
    //主函数返回Promise实例对象, 以便后续调用时可以实现顺序执行异步函数
    $.post(listUrl, (error, resp, data) => {
      //使用post请求查询, 再使用回调函数处理返回的结果
      try {
        //使用try方法捕获可能出现的代码异常
        if (error) {
          throw new Error(error); //如果请求失败, 例如无法联网, 则抛出一个异常
        } else {
          const body = JSON.parse(data); //解析响应体json并转化为对象
          if (body.code == 200 && body.data.mes == "开门成功") {
            //如果接口正常返回商品信息
            console.log("开门成功");
          } else {
            //否则抛出一个异常
            throw new Error("开门失败");
          }
        }
      } catch (e) {
        //接住try代码块中抛出的异常并打印日志
        console.log(e);
      } finally {
        //finally语句在try和catch之后无论有无异常都会执行
        resolve(); //异步操作成功时调用, 将Promise对象的状态标记为"成功", 表示已完成查询商品
      }
    });
  });
}

function nobyda() {
  const isSurge = typeof $httpClient != "undefined";
  const isQuanX = typeof $task != "undefined";
  const isNode = typeof require == "function";
  const node = (() => {
    if (isNode) {
      const request = require("request");
      return {
        request,
      };
    } else {
      return null;
    }
  })();
  const adapterStatus = (response) => {
    if (response) {
      if (response.status) {
        response["statusCode"] = response.status;
      } else if (response.statusCode) {
        response["status"] = response.statusCode;
      }
    }
    return response;
  };
  this.read = (key) => {
    if (isQuanX) return $prefs.valueForKey(key);
    if (isSurge) return $persistentStore.read(key);
  };
  this.notify = (title, subtitle, message) => {
    if (isQuanX) $notify(title, subtitle, message);
    if (isSurge) $notification.post(title, subtitle, message);
    if (isNode) console.log(`${title}\n${subtitle}\n${message}`);
  };
  this.post = (options, callback) => {
    options.headers["User-Agent"] =
      "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 13_6_1 like Mac OS X) AppleWebKit/609.3.5.0.2 (KHTML, like Gecko) Mobile/17G80 BiliApp/822 mobi_app/ios_comic channel/AppStore BiliComic/822";
    if (isQuanX) {
      if (typeof options == "string")
        options = {
          url: options,
        };
      options["method"] = "POST";
      $task.fetch(options).then(
        (response) => {
          callback(null, adapterStatus(response), response.body);
        },
        (reason) => callback(reason.error, null, null)
      );
    }
    if (isSurge) {
      options.headers["X-Surge-Skip-Scripting"] = false;
      $httpClient.post(options, (error, response, body) => {
        callback(error, adapterStatus(response), body);
      });
    }
    if (isNode) {
      node.request.post(options, (error, response, body) => {
        callback(error, adapterStatus(response), body);
      });
    }
  };
  this.done = () => {
    if (isQuanX || isSurge) {
      $done();
    }
  };
}
