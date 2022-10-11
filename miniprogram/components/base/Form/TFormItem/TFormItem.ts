// components/base/Form/TFormItem/TFormItem.ts
Component<{}, {
  style: {
    type: StringConstructor,
    value: "fill" | "plain" | null
  }
}, {}>({
  options: {
    virtualHost: true
  },
  /**
   * 组件的属性列表
   */
  properties: {
    style: {
      type: String,
      value: null,
    }
  },

  relations: {
    "../TForm": {
      type: "parent",
      linked(target) {
        if (!this.properties.style) {
          this.setData({
            style: target.properties.itemStyle
          });
        }
      }
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
