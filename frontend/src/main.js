import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
// 引入需要的 Vant 组件
import {
    Button, Form, Field, CellGroup, RadioGroup, Radio,
    Stepper, Toast, Dialog, Uploader, Switch, Popup, Icon,
    NavBar, Tabbar, TabbarItem, List, SwipeCell, Cell, Tag, Image as VanImage,
    Tab, Tabs, Search, ActionSheet
} from 'vant';
import 'vant/lib/index.css';
// 引入 Vue Lazyload
import VueLazyload from 'vue-lazyload'

const app = createApp(App)

app.use(router)

// 注册 Vue Lazyload
app.use(VueLazyload, {
  preLoad: 1.3,
  error: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
  loading: 'https://fastly.jsdelivr.net/npm/@vant/assets/cat.jpeg',
  attempt: 1
})

// 批量注册 Vant 组件
app.use(Button)
   .use(Form)
   .use(Field)
   .use(CellGroup)
   .use(RadioGroup)
   .use(Radio)
   .use(Stepper)
   .use(Toast)
   .use(Dialog)   // 注册 Dialog
   .use(Uploader) // 注册上传组件 (Gallery.vue 需要)
   .use(Switch)   // 注册开关组件 (Register.vue 需要)
   .use(Popup)    // 注册弹窗组件 (Message.vue 需要)
   .use(Icon)     // 注册图标组件
   .use(NavBar)
   .use(Tabbar)
   .use(TabbarItem)
   .use(List)
   .use(SwipeCell)
   .use(Cell)
   .use(Tag)
   .use(VanImage)
   .use(Tab)
   .use(Tabs)
   .use(Search)
   .use(ActionSheet);

app.mount('#app')
