<!--main.vue -->
<template>
  <var-sticky :offset-top="0">
    <var-app-bar round>
      <template #left>
        <p>
          <client-only>
            <span>{{
              dayjs(store.currentChangCi.createdAt).format('MM月DD日HH:mm-')
            }}{{ store.currentChangCi.name }}</span>
          </client-only>

        </p>
      </template>
      <template #right>
        <var-button color="transparent" text-color="#fff" round text @click="refreshData" style="margin-right: 8px">
          <var-icon name="refresh" :size="24" />
        </var-button>
        <var-menu>
          <var-button color="transparent" text-color="#fff" round text>
            <var-icon name="menu" :size="24" />
          </var-button>
          <template #menu>
            <var-cell @click="changeNameShow = true" ripple>修改场次名称</var-cell>
            <var-cell @click="beilvShow = true" ripple>设置中奖赔率</var-cell>
            <var-cell @click="zhongjiangShow = true" ripple>设置中奖号码</var-cell>
            <var-cell @click="createShow = true" ripple>创建新场次</var-cell>
          </template>
        </var-menu>
      </template>
      <template #content>
        <div>
          <div v-if="store.currentChangCi.pingMaList.length && store.currentChangCi.teMa">
            <span style="padding: 5px;">本期号码：</span>
            <b style="padding: 5px; color: #fd9c00" v-for="(item, index) in store.currentChangCi.pingMaList"
              :key="index">{{
                item
              }}</b>
            <b style="padding: 5px; color: red">{{ store.currentChangCi.teMa }}</b>
          </div>
          <div>
            <span v-if="store.totalBetAmount" style="padding: 5px;">总下注：￥{{ store.totalBetAmount }}</span>
            <span v-if="store.calculateTotalPei()" style="padding: 5px">总赔付:￥{{ store.calculateTotalPei() }}</span>
          </div>
        </div>
        <var-tabs style="margin-top: 5px" color="transparent" active-color="#fff" inactive-color="#ddd"
          v-model:active="active">
          <var-tab>数据展示</var-tab>
          <var-tab>加注操作</var-tab>
          <!-- <var-tab>点击加注</var-tab> -->
          <!-- <var-tab>按生效排序</var-tab>
          <var-tab>按数字排序</var-tab> -->
          <var-tab>历史操作</var-tab>


        </var-tabs>
      </template>
    </var-app-bar>
  </var-sticky>
  <div v-if="active === 0">
    <ShowArea></ShowArea>
  </div>
  <!-- <div v-if="active === 2">
    <SortByZodiac></SortByZodiac>
  </div>
  <div v-else-if="active === 3">
    <SortByNumbers></SortByNumbers>
  </div> -->
  <div v-else-if="active === 1">
    <OperationArea></OperationArea>
  </div>
  <!-- <div v-else-if="active === 2">
    <ClickAddArea></ClickAddArea>
  </div>
   -->
  <div v-else-if="active === 2">
    <OperateHistory></OperateHistory>
  </div>

  <!--修改场次名称 -->
  <var-overlay v-model:show="changeNameShow">
    <div class="overlay-content">
      <div style="padding:20px">
        <var-input placeholder="请输入名称" v-model="newChangciName" autofocus clearable></var-input>
      </div>
      <var-button type="primary" block @click="clickChange">确定修改</var-button>
    </div>
  </var-overlay>
  <!--创建新场次 -->
  <var-overlay v-model:show="createShow">
    <div class="overlay-content">
      <div style="padding:20px">
        <var-input placeholder="请输入名称（便于区分）" v-model="newChangciName" autofocus clearable></var-input>
      </div>
      <var-button type="primary" block @click="clickCreate">确定创建</var-button>
    </div>
  </var-overlay>
  <!--倍率调整-->
  <var-overlay v-model:show="beilvShow">
    <div class="overlay-content">
      <var-cell title="平码倍率">
        <template #extra>
          <var-counter v-model="pingMaBeilv" @change="updateBeilvImmediately" />
        </template>
      </var-cell>
      <var-cell title="特码倍率">
        <template #extra>
          <var-counter v-model="teMaBeilv" @change="updateBeilvImmediately" />
        </template>
      </var-cell>
    </div>
  </var-overlay>
  <!--中奖号码 -->
  <var-overlay v-model:show="zhongjiangShow">
    <div class="overlay-content">
      <var-cell title="特码">
        <template #extra>
          <var-menu-select placement="right-end" size="large" scrollable v-model="teMa" @select="clickConfirm">
            <var-button type="primary">{{ teMa ? teMa : '请选择' }}</var-button>
            <template #options>
              <var-menu-option v-for="item in 49" :label="formatNumber(item)" :key="item" />
            </template>
          </var-menu-select>
        </template>
      </var-cell>
      <var-cell title="平码">
        <template #extra>
          <var-menu-select size="large" scrollable multiple v-model="pingMaArray" placement="right-end"
            @select="updateZhongjiangImmediately">
            <var-button type="primary">{{ pingMaArray.length ? pingMaArray : '请选择' }}</var-button>
            <template #options>
              <var-menu-option v-for="item in 49" :disabled="pingMaNum === 6 || formatNumber(item) == teMa"
                :label="formatNumber(item)" :key="item" />
            </template>
          </var-menu-select>
        </template>
      </var-cell>
      <var-cell>
        <div style="display: flex; justify-content: center; align-items: center">
          <div style="width: 40%; margin-right: 10px;margin-top: 10px">
            <var-button @click="clickReset" block>重置</var-button>
          </div>
          <div style="width: 40%; margin-left: 10px;margin-top: 10px">
            <var-button @click="clickConfirm" type="success" block>确定</var-button>
          </div>
        </div>
      </var-cell>
    </div>
  </var-overlay>


</template>

<script setup lang="ts">
import SortByZodiac from '@/components/SortByZodiac.vue'
import { ref } from 'vue'
import { useMainStore } from "@/stores/mainStore";
import dayjs from "dayjs";
import { Snackbar } from '@varlet/ui'
import OperateHistory from "~/components/OperateHistory.vue";


const active = ref(0)
const store = useMainStore()

store.initialize() // 确保客户端初始化数据
const changeNameShow = ref(false);
const createShow = ref(false);
const beilvShow = ref(false);
const zhongjiangShow = ref(false);
const newChangciName = ref('')

const pingMaBeilv = ref(store.currentChangCi.pingMaBeilv)
const teMaBeilv = ref(store.currentChangCi.teMaBeilv)

const pingMaArray = ref(
  store.currentChangCi.pingMaList
    ? JSON.parse(JSON.stringify(store.currentChangCi.pingMaList))
    : []
)
const pingMaNum = computed(() => {
  return Object.keys(pingMaArray.value).length
})
const teMa = ref(store.currentChangCi.teMa)


//创建新场次
function clickCreate() {
  if (!newChangciName.value.trim()) {
    Snackbar.error('请输入场次名称')
    return
  }

  store.createNewChangCi(newChangciName.value.trim())
  Snackbar.success('创建成功')
  createShow.value = false
  newChangciName.value = ''
  clickReset()
  refreshData()
}
//修改名称
function clickChange() {
  if (!newChangciName.value.trim()) {
    Snackbar.error('请输入场次名称')
    return
  }
  if (newChangciName.value.trim() === store.currentChangCi.name) {
    Snackbar.warning('名称未更改，无需更新')
    return
  }
  const tmp = {
    type: 'name',
    typeText: '场次名称',
    title: '修改场次名称',
    timestamp: Date.now(),
    description: `将场次名称由 "${store.currentChangCi.name}" 修改为 "${newChangciName.value.trim()}"`,
    details: {
      oldName: store.currentChangCi.name,
      newName: newChangciName.value.trim(),
      operator: '管理员'
    }
  }
  store.addOperationRecord(tmp)
  store.updateChangCiName(newChangciName.value.trim())
  Snackbar.success('修改成功')
  changeNameShow.value = false
  newChangciName.value = ''
}

// 实时更新赔率
function updateBeilvImmediately() {
  if (!store.currentChangCi) return
  // 防抖处理，避免频繁更新
  debounce(() => {
    Snackbar.success('赔率已更新')
    const tmp = {
      type: 'beilv',
      typeText: '赔率设置',
      title: '修改赔率',
      timestamp: Date.now(),
      description: `将赔率由 "平码: ${store.currentChangCi.pingMaBeilv}，特码: ${store.currentChangCi.teMaBeilv}" 修改为 "平码: ${pingMaBeilv.value}，特码: ${teMaBeilv.value}"`,
      details: {
        oldPingMaBeilv: store.currentChangCi.pingMaBeilv,
        oldTeMaBeilv: store.currentChangCi.teMaBeilv,
        newPingMaBeilv: pingMaBeilv.value,
        newTeMaBeilv: teMaBeilv.value,
        operator: '管理员'
      }
    }
    console.log(tmp)
    store.addOperationRecord(tmp)
    store.updateBeilv(pingMaBeilv.value, teMaBeilv.value)

  }, 1000)()
}

// 简单的防抖函数
function debounce(fn: Function, delay: number) {
  let timer: NodeJS.Timeout
  return function () {
    clearTimeout(timer)
    timer = setTimeout(() => fn(), delay)
  }
}

//平码选择
function updateZhongjiangImmediately(newPingMa: string) {
  // 检查平码数量
  if (pingMaNum.value >= 6) {
    Snackbar.error('平码数量已达上限，最多只能添加6个平码')
    return false
  }
  // 检查是否已存在该平码
  if (Object.values(pingMaArray.value).includes(newPingMa)) {
    Snackbar.warning(`取消 ${newPingMa}成功，当前平码数量: ${pingMaNum.value - 1}/6`)
    return false
  }
  // 添加新平码（自动生成下一个数字键）
  pingMaArray.value[pingMaNum.value] = newPingMa
  // 提示当前平码数量
  Snackbar.success(`已添加平码 ${newPingMa}，当前平码数量: ${pingMaNum.value}/6`)
  if (pingMaNum.value === 6) {
    clickConfirm()
    zhongjiangShow.value = false
  }
  return true
}

// 重置按钮点击事件
function clickReset() {
  // 清空平码列表
  pingMaArray.value = []
  // 清空特码
  teMa.value = ''
  // 更新到store
  store.currentChangCi.pingMaList = []
  store.currentChangCi.teMa = teMa.value

  Snackbar.success('已重置所有选择')
  store.updateWinningNumbers()

}

// 确定按钮点击事件
async function clickConfirm() {
  await nextTick() // 等待所有响应式更新完成
  // 强制获取最新值
  const currentTeMa = teMa.value
  const currentPingMa = Object.values(pingMaArray.value)

  if (pingMaNum.value < 6) {
    Snackbar.error(`请选择6个平码，当前已选${pingMaNum.value}个`)
    return
  }

  if (!currentTeMa) {
    Snackbar.error('请选择特码')
    return
  }

  if (currentPingMa.includes(currentTeMa)) {
    Snackbar.error('特码不能与平码相同')
    return
  }
  // 获取当前值
  const oldPingMa = store.currentChangCi.pingMaList || []
  const oldTeMa = store.currentChangCi.teMa || ''
  // 检查是否有变化
  const pingMaChanged = JSON.stringify(oldPingMa.sort()) !== JSON.stringify([...currentPingMa].sort())
  const teMaChanged = oldTeMa !== currentTeMa

  if (pingMaChanged || teMaChanged) {
    // 更新中奖号码
    store.currentChangCi.pingMaList = currentPingMa
    store.currentChangCi.teMa = currentTeMa
    const tmp = {
      type: 'zhongjiang',
      typeText: '中奖号码',
      title: '修改中奖号码',
      timestamp: Date.now(),
      description: `将中奖号码由 "平码: [${oldPingMa.join(', ')}]->[${currentPingMa.join(', ')}]，特码: ${oldTeMa}-> 特码: ${currentTeMa}`,
      details: {
        oldPingMa: oldPingMa,
        oldTeMa: oldTeMa,
        newPingMa: currentPingMa,
        newTeMa: currentTeMa,
        operator: '管理员'
      }
    }
    store.addOperationRecord(tmp)

    Snackbar.success('保存成功！')
    store.updateWinningNumbers()
  } else {
    Snackbar.success('未检测到变化，无需更新')
  }
}

const refreshData = () => {
  Snackbar.success('数据已刷新');
  window.location.reload();
};
// 数字格式化函数
const formatNumber = (num: any) => {
  return num.toString().padStart(2, '0')
}
</script>
<style>
.overlay-content {
  padding: 24px;
  width: 380px;
  border-radius: 28px;
  background-color: whitesmoke;
}
</style>