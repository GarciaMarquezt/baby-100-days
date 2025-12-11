<template>
  <div class="page-admin">
    <van-form @submit="onSubmit">
        <van-cell-group inset title="基础设置">
            <van-field
                v-model="form.babyName"
                name="babyName"
                label="宝宝姓名"
                placeholder="请输入"
                :rules="[{ required: true, message: '请填写姓名' }]"
            />
            <van-field
                v-model="form.partyDate"
                name="partyDate"
                label="宴会时间"
                placeholder="例如: 2026-01-10 12:00"
            />
            <van-field
                v-model="form.partyAddress"
                name="partyAddress"
                label="宴会地点"
                placeholder="地点名称"
            />
        </van-cell-group>

        <van-cell-group inset title="高级设置" style="margin-top: 20px;">
            <van-field
                v-model="form.theme"
                name="theme"
                label="主题色"
                placeholder="red_gold / pink / blue"
            />
             <van-field name="switch" label="开启注册">
                <template #input>
                    <van-switch v-model="form.enableRegister" />
                </template>
            </van-field>
        </van-cell-group>

        <div style="margin: 30px 16px;">
            <van-button round block type="primary" color="#8c2a2a" native-type="submit">
            保存设置
            </van-button>
        </div>
    </van-form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getConfig, updateConfig } from '../../api/admin';
import { showToast, showLoadingToast, closeToast } from 'vant';

const form = ref({
    babyName: '',
    partyDate: '',
    partyAddress: '',
    theme: '',
    enableRegister: true
});

onMounted(async () => {
    const res = await getConfig();
    if (res.code === 0) {
        // 合并数据
        const data = res.data;
        form.value = {
            ...form.value,
            ...data,
            // 特殊处理 switch，接口返回的可能是 string "true"/"false"
            enableRegister: data.enableRegister === 'true' || data.enableRegister === true
        };
    }
});

const onSubmit = async (values) => {
    showLoadingToast({ message: '保存中...', forbidClick: true });
    
    // 转换 switch
    const payload = { ...values, enableRegister: String(form.value.enableRegister) };
    
    try {
        const res = await updateConfig(payload);
        closeToast();
        if (res.code === 0) {
            showToast('设置已更新');
        } else {
            showToast('更新失败');
        }
    } catch (e) {
        closeToast();
    }
};
</script>

<style scoped>
.page-admin { padding-top: 15px; }
</style>
