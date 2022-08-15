import {defineComponent} from 'vue'
export default defineComponent({
    setup() {
        const message = "我是jsx页面哦"
        return ()=>(
            <div>{message}</div>
        )
    }
})