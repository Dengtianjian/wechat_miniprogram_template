import eventBus from "../../../foundation/EventBus";

// components/base/TFullScreenContainer/TFullScreenContainer.ts
const A = getApp();

Component<{
  CustomNavbarHeight: number
}, {
  justify: {
    type: StringConstructor,
    value: "start" | "end" | "center" | "space-between" | "space-everly" | "space-around" | string
  },
  align: {
    type: StringConstructor,
    value: "start" | "end" | "center" | string
  },
  //* 计算容器高度时需要减去的高度，带上单位，目前会获取页面自定义导航栏的高度，cala(100vh - 导航栏高度 - subtracive)
  subtracive: {
    type: StringConstructor,
    value: string
  }
}, {}>({
  /**
   * 组件的属性列表
   */
  properties: {
    justify: {
      type: String,
      value: "start"
    },
    align: {
      type: String,
      value: "start"
    },
    subtracive: {
      type: String,
      value: "0px"
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    CustomNavbarHeight: A.globalData.System.CustomNavbarHeight
  },

  /**
   * 组件的方法列表
   */
  methods: {

  },

  lifetimes: {
    attached() {
      eventBus.subscribe("CustomNavbar", (params) => {
        this.setData({
          CustomNavbarHeight: params.height
        })
      });
    }
  }
})
