// components/keyboard/keyboard.js
import {resource} from '../../utils/resource'
let numRexExp = [
  /^(\d{1,})?$/,
  /^(([1-9]\d{0,})|0)((\.)|(\.\d{1,2}))?$/
];
let showRexExp = [
  /(....)(?=.)/g,
  /\B(?=(?:\d{3}(\.|\.\d+)?)+$)/g,
];

function getIndex(type){
  switch(type) {
    case 'money':
      return 1;
    default: 
      return 0;
  }
}

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 当前输入值
    value: {
      type: String,
      value: '',
      observer: 'valueChange'
    },
    // 当前输入类型 default money
    type: {
      type: String,
      value: 'default',
    },
    // 默认值
    defaultValue: {
      type: String,
      value: '',
    },
    // 最大值
    max: {
      type: Number,
      value: -1,
    },
    // 最大长度
    maxLength: {
      type: Number,
      value: -1,
    },
    // 是否使用格式化显示
    useFormate: {
      type: Boolean,
      value: true
    },
    title: {
      type: String,
      value: '请输入'
    },
    tips: {
      type: String,
      value: ''
    },
    submit: {
      type: String,
      value: '确定'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    resource: resource,
    current: '',
    currentNum: '',
    _touching: false,
    _pay: false,
    r: undefined,
  },

  created() {
  },

  attached() {
    this.data.r = numRexExp[getIndex(this.data.type)];
    this.data.showR = showRexExp[getIndex(this.data.type)];
    this.valueChange(this.data.value);
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 按键点击
     */
    numClick(e) {
      if (this.data._touching) return;

      this.data._touching = true;

      ({
        current: this.data.current,
        currentNum: this.data.currentNum
      } = moneySet(
        this.data.current,
        Number.parseInt(e.currentTarget.dataset.type),
        this.data.type,
        this.data.r,
        this.data.defaultValue,
        this.data.max,
        this.data.maxLength
      ));

      this.setData({
        current: this.data.current,
        currentShow: getCurrentShow(this.data.current, this.data.type, this.data.useFormate),
        _pay: !!this.data.current
      });

      this.data._touching = false;

      this.triggerEvent('change', { value: {
        current: this.data.current,
        currentNum: this.data.currentNum,
      }});
    },

    /**
     * 传入值变化
     */
    valueChange(value) {
      if (value === this.data.current) {
        return;
      }
      
      if (!this.data.r || !moneyTest(value, this.data.r, this.data.max, this.data.maxLength)) {
        return;
      }

      ({
        current: this.data.current,
        currentNum: this.data.currentNum
      } = moneySure(
        value || this.data.defaultValue,
        this.data.type,
      ));

      this.setData({
        current: this.data.current,
        currentShow: getCurrentShow(this.data.current, this.data.showR, this.data.useFormate),
        _pay: !!this.data.current
      });

      this.data._touching = false;
    },

    /**
     * 点击确认
     */
    validate() {
      if (!this.data._pay) return;

      this.triggerEvent('confirm', {
        value: {
          current: this.data.current,
          currentNum: this.data.currentNum,
        }
      });
    },

    /**
     * 清除数据
     */
    clear() {
      this.setData({
        current: '',
        currentNum: '',
        currentShow: 0,
        _pay: false
      });

      this.triggerEvent('change', {
        value: {
          current: this.data.current,
          currentNum: this.data.currentNum,
        }
      });
    }

  },
})

/**
 * 点击键盘后对要显示的金额进行初步控制
 * 
 * @param  {String} current 当前显示值，单位元
 * @param  {Number} next 点击的值
 * @param  {String} type 判断类型，当前只支持money，其他情况直接输出，并且currentNum为0
 * @param  {RegExp} r 正则表达式
 * @param  {String} defaultV 清空后的默认值
 * @param  {Number} max 最大值，单位分
 * @param  {Number} maxLength 最大长度
 * @return {Object}    返回当前显示值，转化为分的值
 */
const moneySet = (current, next, type, r, defaultV = "", max = -1, maxLength = -1) => {

  let currentOld = current;
  switch (next) {
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:
    case 8:
    case 9:
    case 0: // 数字
      if (type != "money") {
        current += moneyTest(current + "" + next, r, max, maxLength) ? "" + next : '';
      } else {
        current = (current == "0" && next != 0) ? "" : current;

        current += moneyTest(current + "" + next, r, max, maxLength) ? "" + next : '';
      }
      break;
    case 11: // 点

      if (!current || current == "") current = "0";

      current += moneyTest(current + ".", r, max, maxLength) ? "." : '';

      break;
    case 12: // 退格
      // 直到字符串长度为0不再缩减字符串
      if (!current || current.length < 1) break;

      let l = current.length;
      current = current.substring(0, l - 1);

      break;
  };

  current = current || defaultV;

  return moneySure(current, type);
};
/**
 * 校验值是否符合规则，最大值小于0表示无最大值。
 */
let moneyTest = (current, r, max = -1, maxLength = -1) => {
  return r.test(current) && (max <= 0 || moneyToNum(current) < max) && (maxLength <= 0 || current.length <= maxLength);
};

/**
 * 确认金额是否大于0，大于0才可以点击支付按钮
 * 并把计算好的金额写入页面 
 */
let moneySure = (current, type) => {
  return {
    current: current,
    currentNum: type == "money" ? moneyToNum(current) : 0
  };
};
/**
 * 转化为数字，单位为分
 * @param  {String} str 字符串金额
 * @return {Integer}    单位为分的金额
 */
let moneyToNum = (str) => {
  if (!str) return 0;

  let length = str.length;

  if (length < 1) return 0;

  let point = str.indexOf('.');

  str += point < 0 ? '.00' : '00';

  str = str.substr(0, str.indexOf('.') + 3).replace('.', '');

  return parseInt(str);
};

function getCurrentShow(current, type, useFormate) {
  if (!current) return '';

  let showR = showRexExp[getIndex(type)];

  return useFormate ? (type === 'money' ? current.replace(showR, ',') : current.replace(showR, '$1 ')) : current;
}
