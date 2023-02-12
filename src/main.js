import $ from "jquery";
import http from "./http";
import { getCookie, toggleDisplay, getQueryString, showEl, hideEl } from "./utils";
import setRem from "./setRem.js";
import "./css/reset.css";
import "./css/swiper-bundle.min.css";
import "./css/common.css";
import "./css/main.css";

const act_name = "0215_mh";
const last_login_time = localStorage.getItem("last")
const last_date = last_login_time ? last_login_time.split(" ")[0].split("-")[2] : 0
const date = new Date().getDate()
// 能否抽奖
let get_prize_times = 0;
let look_ad_times = 0;
// 用户信息
let user = {};
let tel = last_date >= date ? localStorage.getItem("tel") : "";
let countdown = 60
let adCount = 2 //15
let t_d = "2023-02-16"

// Image对象来预加载图片
var images = new Array()
function preload() {
  for (let i = 0; i < arguments.length; i++) {
    images[i] = new Image()
    images[i].src = arguments[i]
  }
}

preload(
  "http://h5.cdn.intech.szhhhd.com/jx/a20230215_mh/images/index1.gif",
  "http://h5.cdn.intech.szhhhd.com/jx/a20230215_mh/images/index2.gif",
  "http://h5.cdn.intech.szhhhd.com/jx/a20230215_mh/images/game1.gif",
  "http://h5.cdn.intech.szhhhd.com/jx/a20230215_mh/ad1.jpg",
  "http://h5.cdn.intech.szhhhd.com/jx/a20230215_mh/ad2.jpg",
  "http://h5.cdn.intech.szhhhd.com/jx/a20230215_mh/ad3.jpg",
  "http://h5.cdn.intech.szhhhd.com/jx/a20230215_mh/ad4.jpg",
  "http://h5.cdn.intech.szhhhd.com/jx/a20230215_mh/ad5.jpg",
  "http://h5.cdn.intech.szhhhd.com/jx/a20230215_mh/images/1-1.gif",
  "http://h5.cdn.intech.szhhhd.com/jx/a20230215_mh/images/1-2.gif",
  "http://h5.cdn.intech.szhhhd.com/jx/a20230215_mh/images/2-1.gif",
  "http://h5.cdn.intech.szhhhd.com/jx/a20230215_mh/images/2-2.gif",
  "http://h5.cdn.intech.szhhhd.com/jx/a20230215_mh/images/3-1.gif",
  "http://h5.cdn.intech.szhhhd.com/jx/a20230215_mh/images/3-2.gif",
  "http://h5.cdn.intech.szhhhd.com/jx/a20230215_mh/images/4-1.gif",
  "http://h5.cdn.intech.szhhhd.com/jx/a20230215_mh/images/4-2.gif",
  "http://h5.cdn.intech.szhhhd.com/jx/a20230215_mh/images/5-1.gif",
  "http://h5.cdn.intech.szhhhd.com/jx/a20230215_mh/images/5-2.gif",
  "http://h5.cdn.intech.szhhhd.com/jx/a20230215_mh/images/6-1.gif",
  "http://h5.cdn.intech.szhhhd.com/jx/a20230215_mh/images/6-2.gif",
  "http://h5.cdn.intech.szhhhd.com/jx/a20230215_mh/images/7-1.gif",
  "http://h5.cdn.intech.szhhhd.com/jx/a20230215_mh/images/7-2.gif",
  "http://h5.cdn.intech.szhhhd.com/jx/a20230215_mh/images/8-1.gif",
  "http://h5.cdn.intech.szhhhd.com/jx/a20230215_mh/images/8-2.gif",
  "http://h5.cdn.intech.szhhhd.com/jx/a20230215_mh/images/9-1.gif",
  "http://h5.cdn.intech.szhhhd.com/jx/a20230215_mh/images/9-2.gif",
)

function getUserInfo() {
  if (!tel) return
  return http
    .get(`/get_userinfo?tel=${tel}&act_name=${act_name}&t_d=${t_d}`)
    .then((res) => {
      if (res.data) {
        user = res.data.data;
        look_ad_times = user.look_ad_times;
        get_prize_times = user.get_prize_times;
      } else {
        // 请求失败显示主页
        toggleDisplay($(".index"));
      }
    });
}

// 倒计时处理
function settime(val) {
  var int = setTimeout(function () {
    settime(val)
  }, 1000)
  if (countdown == 0) {
    showEl($(".sendcode-btn"))
    hideEl($(".sendcode-btn-empty"))
    clearInterval(int);
    countdown = 60;
  } else {
    $(".sendcode-btn-empty").text(countdown)
    countdown--;
  }
}

function adTimer(val) {
  var int = setTimeout(function () {
    adTimer(val)
  }, 1000)
  if (adCount == 0) {
    showEl($(".time-close-btn"))
    hideEl($(".time"))
    clearInterval(int);
    adCount = 15;
  } else {
    $(".time").text(`倒计时${adCount}秒`)
    adCount--;
  }
}

// 验证码--test mode
function getVcode(tel) {
  console.log("getVcode");
  http
    .get(`/get_vcode?&act_name=${act_name}&tel=${tel}&type=test`) //&type=test
    .then((res) => {
      if (res.data && res?.data?.code == 0) {
        // 正常逻辑不需要处理什么
        const code = res.data.msg
        $("#vcode").val(code)
      } else {
        alert(res.data?.msg)
      }
    });
}

// 登陆
function login(u_tel, vcode) {
  console.log("login");
  http
    .get(`/tel_login?act_name=${act_name}&tel=${u_tel}&vcode=${vcode}`)
    .then((res) => {
      if (res.data && res.data.code == 0) {
        toggleDisplay($(".manghe"));
        tel = u_tel
        localStorage.setItem("tel", tel)
        localStorage.setItem("last", res.data.data?.last_login_time)
      } else {
        alert(res.data?.msg)
      }
    });
}

// 抽奖
function drawPrize() {
  console.log("darpriz", get_prize_times, look_ad_times)
  if (get_prize_times == 0 || (get_prize_times == 1 && look_ad_times == 1)) {
    http
      .get(`/get_prize?act_name=${act_name}&tel=${tel}&t_d=${t_d}`) // t_d
      .then((res) => {
        if (res.data) {
          // 当天抽奖次数已达上限
          if (res.data.code == 10020 || res.data.code === 10021) {
            showEl($(".draw-fail"))
          } else if (res.data.code == 0) {
            // 抽奖成功，减少抽奖次数，直接调用user接口
            // 1号 - 15GB畅视融合包
            // 2号 - 10GB定向流量大礼包
            // 3号 - 5GB通用流量包+联通云盘100GB乐享会员
            // 4号 - 25GB快手定向流量包
            // 5号 - 兔墩墩毛绒钥匙扣一个
            // 6号 - 兔墩墩吉祥如意徽章一个
            // 7号 - 兔墩墩盲盒一个
            const prizeId = res.data.data.prize_id;

            openBlindBox()

            setTimeout(() => {
              closeAwardMask()
              $(".prize-wrap").removeClass("hide")
              $(`.prize${prizeId}`).removeClass("hide")
              $(`.jp-prize${prizeId}`).removeClass("hide")
            }, 1000)
          } else {
            // alert(res.data?.msg || "您无抽奖资格")
          }
          getUserInfo()
        }
      });
  } else if (look_ad_times == 0) {
    // 放广告
    adTimer()
    const num = Math.floor(Math.random() * 5) + 1;
    $(".ad").prepend(`<img src="http://h5.cdn.intech.szhhhd.com/jx/a20230215_mh/ad${num}.jpg" width="100%"" />`)
    showEl($(".ad"))
    // "look_ad_times":0,	//今天观看的广告次数
    // "get_prize_times":0,	//今天抽奖次数
  } else {
    // 抽奖次数已用完
    showEl($(".draw-fail"))
    // hideEl($(".award"))
    closeAwardMask()
  }
}

// 登记信息
function checkin(address, true_tel, username) {
  console.log("checkin");
  if (address && true_tel && username) {
    let url = `/leave_userinfo?act_name=${act_name}&address=${address}&tel=${tel}&username=${username}&true_tel=${true_tel}`
    http
      .get(url)
      .then((res) => {
        if (res.data.code == 0) {
          alert("登记成功")
          $(".info").addClass("hide")
        } else {
          alert(res.data?.msg || "登记失败")
        }
      });
  } else {
    alert("请填写完整收货信息")
  }
}

// 看广告
function set_ad_info() {
  console.log("set_ad_info");
  let url = `/set_ad_info?act_name=${act_name}&tel=${tel}&t_d=${t_d}`
  http
    .get(url)
    .then((res) => {
      getUserInfo()
    });
}

function link(id) {
  const map = {
    1: "https://wo.zj186.com/v/6jiaqm", // 15G
    2: "https://wo.zj186.com/v/eaUJ7b", // 多视频
    3: "https://wo.zj186.com/v/JRjQni", // 5G
    4: "https://wo.zj186.com/v/qyENbe", // 25G
  }
  if (map[id]) {
    window.location.href = map[id];
  }
}

// 关闭 抽盲盒弹窗
function closeAwardMask() {
  const awardMask = $(".award-mask")
  const index = awardMask.attr("data-index")
  awardMask.removeClass(`show`)

  setTimeout(() => {
    awardMask.removeClass(`award-${index} opened`).removeAttr("data-index")
    hideEl(awardMask)
    $(`.award-sure-btn`).removeClass("show")
    $(`.award-close-btn`).removeClass("show")
    $(`.award-light`).removeClass("show award-light-animate")
  }, 300)
}

// 开盲盒
function openBlindBox() {
  const awardMask = $(".award-mask")

  const isOpened = awardMask.hasClass("opened")
  const isAwardMaskShow = awardMask.hasClass("show")

  if (!isOpened && isAwardMaskShow) {
    awardMask.addClass("opened");
  }
}

$(function () {
  setTimeout(() => {
    hideEl($(".loading"))
    showEl($(".index"))
  }, 2000)
  setRem(750, 750, 325);
  getUserInfo();

  // 打开登陆弹窗
  $(".a-login").on("click", function () {
    console.log("login", tel)
    if (!tel) {
      showEl($(".login"));
    } else {
      toggleDisplay($(".manghe"))
    }
  });

  //点击登录
  $(".login-btn").on("click", function () {
    const tel = $("#tel").val() || $("#index-tel").val();
    const vcode = $("#vcode").val() || $("#index-vcode").val();
    console.log("login,", tel, vcode)
    if (tel && vcode) {
      login(tel, vcode);
    }
  });

  // 发送验证码
  $(".sendcode-btn").on("click", function () {
    const tel = $("#tel").val() || $("#index-tel").val();
    if (tel) {
      showEl($(".sendcode-btn-empty"))
      hideEl($(".sendcode-btn"))
      settime($(".sendcode-btn-empty"))
      getVcode(tel)
    }
  });

  // 点击奖品
  // $(".item").on("click", function () {
  //   const index = $(this).attr("data-index")
  //   console.log("index", index)
  //   $(`.award${index}`).removeClass("hide")
  //   $(`.jp`).removeClass("hide")
  //   setTimeout(() => {
  //     $(`.jp_click-btn`).removeClass("hide")
  //     $(`.jp_prize-close-btn`).removeClass("hide")
  //   }, 1500)
  // })

  $(".item").on("click", function () {
    const index = $(this).attr("data-index")
    console.log("index", index)
    const awardMask = $(".award-mask")
    const awardPic = awardMask.find(".award-pic")
    console.log(awardPic, 'awardPic')
    awardMask.removeClass("hide")

    requestAnimationFrame(() => {
      awardMask.addClass(`award-${index} show`).attr("data-index", index)

      awardPic.addClass("animate__animated animate__zoomInDown")

      setTimeout(() => {
        awardPic.removeClass("animate__zoomInDown").addClass("animate__bounce")
      }, 700)

      setTimeout(() => {
        $(`.award-sure-btn`).addClass("show")
        $(`.award-close-btn`).addClass("show")
        $(`.award-light`).addClass("award-light-animate")
      }, 2000)
    })
  })



  // 盲盒的关闭按钮
  $(".award-close-btn").on("click", function () {
    closeAwardMask()
  });

  // 拆
  $(".award-sure-btn").on("click", function () {

    const isOpened = $(".award-mask").hasClass("opened")

    if (!isOpened) {
      // 调抽奖接口
      drawPrize()
    } else {
      closeAwardMask()
    }
  });


  // 弹窗的关闭按钮
  $(".close-btn").on("click", function () {
    const popup = $(this).parent(".popup-wrap")
    hideEl(popup)
  });

  $(".prize-close-btn").on("click", function () {
    const popup = $(this).parent(".prize").parent(".prize-wrap")
    hideEl(popup)
  });

  // 选择
  $(".choose-btn").on("click", function () {
    const popup = $(this).parent(".popup-wrap")
    const index = popup.attr("data-index");
    // 设置popup背景图
    popup.addClass(`award${index}_2`)
    // 调抽奖接口
    drawPrize()
    setTimeout(() => {
      hideEl(popup)
    }, 1000)
  });

  $(".jp_click-btn").on("click", function () {
    // const popup = $(this).parent(".popup-wrap")
    // const index = popup.attr("data-index");
    // 设置popup背景图
    $(".jp_item").addClass(`gift`)
    // popup.addClass(`gift`)
    // 调抽奖接口
    drawPrize()
    // setTimeout(() => {
    //   hideEl(popup)
    // }, 1000)
  });

  /** 点击跳转到外部链接 */
  $(".buy-btn").on("click", function () {
    const id = $(this).attr("data-id")
    link(id)
  })

  /** 点击留资 */
  $(".buy-2-btn").on("click", function () {
    // const id = $(this).attr("data-id")
    // 打开留资弹窗
    $(".info").removeClass("hide")
  })

  $(".info-btn").on("click", function () {
    const name = $("#info-name").val();
    const tel = $("#info-tel").val();
    const addr = $("#info-addr").val();
    checkin(addr, tel, name)
  })

  $(".draw-fail-btn").on("click", function () {
    hideEl($(".draw-fail"))
    hideEl($(".draw-finish"))
    hideEl($(".rule-wrap"))
  })

  // -------------------------
  // 关闭
  $(".time-close-btn").on("click", function () {
    hideEl($(".ad"))
    // 
    set_ad_info()
  })

  // 我的奖品按钮
  $(".box-btn ").on("click", function () {
    // 重新获取一下用户的中奖信息

    showEl($(".my-prize-wrap"))
    user.prize_log?.map(item => {
      const id = item.prize_id;
      $(".c-wrap").children(`.p${id}`).removeClass("hide")
    })
  });

  $(".p-btn").on("click", function () {
    const id = $(this).parent(".prizing").attr("data-id")
    link(id)
  });

  $(".p-btn-2").on("click", function () {
    // if(!user.address) {
    //   $(".info").removeClass("hide")
    // } else {
    $(".draw-finish").removeClass("hide")
    // }
    hideEl($(".my-prize-wrap"))
  });

  // 打开规则也
  $(".rule-btn").on("click", function () {
    showEl($(".rule-wrap"))
  });

  // 关闭规则也
  $(".rule-back-btn").on("click", function () {
    hideEl($(".rule-wrap"))
  });

  $(".prize-close").on("click", function () {
    hideEl($(".my-prize-wrap"))
  });

  // 去抽奖
  $(".checkin-sussess-btn").on("click", function () {
    const baiduHtm = [
      "a20211118_zslt",
      "click",
      "popup_button3",
      "弹窗-登记成功-去抽奖",
    ];
    _hmt.push([
      "_trackEvent",
      baiduHtm[0],
      baiduHtm[1],
      baiduHtm[2],
      baiduHtm[3],
    ]);
    getPrizing();
    makePrizes();
    toggleDisplay($(".prize-page"))
  });

  // 核销
  $(".has-prize").on("click", ".prize-checkin-btn", function (ev) {
    prizeId = $(this).attr("id");
    // 获取元素id(选择的值)
    console.log("answer", prizeId);
    const baiduHtm = [
      "a20211118_zslt",
      "click",
      "popup_button17",
      "弹窗-我的奖品-去核销按钮",
    ];
    _hmt.push([
      "_trackEvent",
      baiduHtm[0],
      baiduHtm[1],
      baiduHtm[2],
      baiduHtm[3],
    ]);
    showEl($(".verify-wrap"))
    hideEl($(".my-prize-wrap"))
  });

  //  确认核销
  $(".verify-btn").on("click", function () {
    const verifycode = $("#averify").val()
    if (verifycode && prizeId) {
      const baiduHtm = [
        "a20211118_zslt",
        "click",
        "popup_button9",
        "弹窗-核销-确认核销",
      ];
      _hmt.push([
        "_trackEvent",
        baiduHtm[0],
        baiduHtm[1],
        baiduHtm[2],
        baiduHtm[3],
      ]);
      verifyPrize(prizeId, verifycode)
    }
  });
});
