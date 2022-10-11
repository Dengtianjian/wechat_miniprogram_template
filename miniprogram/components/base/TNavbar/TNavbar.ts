import EventBus from "../../../foundation/EventBus";
import Helper from "../../../foundation/Helper"

const A = getApp();

const dis = EventBus.distribute("CustomNavbar");

// components/base/navbar/navbar.ts
Component<{
  statusBarHeight: number
  navbarMarginTop: number
  padding: number
  menuWidth: number
  styleString: string
  defaultStyleString: string
  reachStyleString: string
  styleColorValue: string
  barHeight: number,
  pages: string[],
  isHomePage: boolean
}, {
  top: {
    type: NumberConstructor,
    value: number,
    observer: () => void
  },
  threshold: {
    type: NumberConstructor,
    value: number,
  }
  backBackground: {
    type: StringConstructor,
    value: string,
  }
  frontBackground: {
    type: StringConstructor,
    value: string
  }
  defaultOpacity: {
    type: NumberConstructor,
    value: number
  }
  reachOpacity: {
    type: NumberConstructor,
    value: number
  }
  defaultColor: {
    type: StringConstructor,
    value: string
  }
  reachColor: {
    type: StringConstructor,
    value: string
  }
  fixed: {
    type: BooleanConstructor,
    value: boolean
  }
  zIndex: {
    type: NumberConstructor,
    value: number
  }
}, {
  updateBackgroundOpacity: () => void,
  back: () => void
  home: () => void
}>({
  options: {
    addGlobalClass: true,
    multipleSlots: true
  },
  lifetimes: {
    attached() {
      const Pages = getCurrentPages();
      const pages: string[] = [];
      Pages.forEach(item => {
        pages.push(item.route);
      });
      const HomePageRoute: string = pages[0];
      const CureentPageRoute: string = pages[pages.length - 1];

      const SystemInfo = wx.getSystemInfoSync();
      const MenuButtonRect = wx.getMenuButtonBoundingClientRect();
      const diff: number = MenuButtonRect.top - SystemInfo.statusBarHeight;

      const styleStrings: string[] = [
        `background-color:${this.data.frontBackground}`,
        `opacity:${this.data.defaultOpacity}`
      ];

      const styleString: string = styleStrings.join(";");

      this.setData({
        statusBarHeight: SystemInfo.statusBarHeight,
        navbarHeight: MenuButtonRect.height + (diff * 2),
        padding: SystemInfo.screenWidth - MenuButtonRect.right,
        menuWidth: MenuButtonRect.width,
        styleString,
        styleColorValue: this.data.defaultColor,
        pages,
        isHomePage: HomePageRoute === CureentPageRoute
      });

      wx.nextTick(() => {
        this.createSelectorQuery().select(".bar").boundingClientRect((res) => {
          this.setData({
            barHeight: res.height
          });
          A.globalData.System.CustomNavbarHeight = res.height;
          dis.complete({
            height: res.height
          });
        }).exec();
      });
    },
  },
  /**
   * 组件的属性列表
   */
  properties: {
    top: {
      type: Number,
      value: 0,
      observer() {
        if (this.data.threshold <= 0) return;
        Helper.throttle.call(this, "navbarTop", this.updateBackgroundOpacity)();
      }
    },
    threshold: {
      type: Number,
      value: 0
    },
    backBackground: {
      type: String,
      value: "white"
    },
    frontBackground: {
      type: String,
      value: "white"
    },
    defaultOpacity: {
      type: Number,
      value: 0
    },
    reachOpacity: {
      type: Number,
      value: 1
    },
    defaultColor: {
      type: String,
      value: "black"
    },
    reachColor: {
      type: String,
      value: "white"
    },
    fixed: {
      type: Boolean,
      value: true
    },
    zIndex: {
      type: Number,
      value: 1
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    statusBarHeight: 0,
    navbarMarginTop: 0,
    padding: 0,
    menuWidth: 0,
    styleString: "",
    defaultStyleString: "",
    reachStyleString: "",
    styleColorValue: "",
    barHeight: 0,
    isHomePage: false,
    pages: []
  },

  /**
   * 组件的方法列表
   */
  methods: {
    updateBackgroundOpacity() {
      if (!this.data.threshold) return;
      let opacity: number = this.data.defaultOpacity;
      let threshold: number = this.data.threshold + (opacity * this.data.threshold);
      let color: string = this.data.defaultColor;
      if (this.data.top >= threshold) {
        opacity = this.data.reachOpacity;
        color = this.data.reachColor;
      } else {
        opacity = this.data.top / threshold + this.data.defaultOpacity;
        if (opacity >= this.data.reachOpacity) {
          opacity = this.data.reachOpacity;
        }
        color = this.data.defaultColor;
      }

      const styleStrings: string[] = [
        `background-color:${this.data.frontBackground}`
      ];
      styleStrings.push(`opacity:${opacity}`);

      this.setData({
        styleString: styleStrings.join(";"),
        styleColorValue: color
      });
    },
    back() {
      wx.navigateBack();
    },
    home() {
      wx.reLaunch({
        url: `/${this.data.pages[0]}`
      });
    }
  }
})
