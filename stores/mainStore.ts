//mainStore
import {defineStore} from 'pinia'
import type {ChangCiItem, ZodiacDataArray} from "~/types/zodiac";
import {staticPingMaBeiLv, staticTeMaBeiLv, zodiacDataArray} from "~/data/zodiac";


export const useMainStore = defineStore('main', {
    state: () => ({
        currentChangCiId: 0,
        changCiList: [] as ChangCiItem<{}>,
        currentZodiacData: [] as ZodiacDataArray,
        morenPingMaBeiLv: staticPingMaBeiLv,
        morenTeMaBeiLv: staticTeMaBeiLv
    }),
    getters: {
        // 获取当前场次信息
        currentChangCi: (state) => {
            if (state.changCiList.length === 0) return null
            return state.changCiList.find(item => item.id === state.currentChangCiId)
                ?? state.changCiList[0] // 默认返回第一个场次
        },
        // 获取所有号码的总投注额
        totalBetAmount: (state) => {
            return state.currentZodiacData.reduce((sum, item) => sum + item.total, 0)
        },
        // 获取特定生肖下的所有号码
        getNumbersByZodiac: (state) => (zodiacName: string) => {
            return state.currentZodiacData
                .filter(item => item.name === zodiacName)
                .map(item => item.number)
        },

        // 获取特定生肖的投注额
        getZodiacBetAmount: (state) => (zodiacName: string) => {
            return state.currentZodiacData
                .filter(item => item.name === zodiacName)
                .reduce((sum, item) => sum + item.total, 0)
        },
        //获取特定号码的投注额
        getBetByNumber: (state) => {
            return (number: string) => state.currentZodiacData.find(item => item.number === number)?.total || 0
        }
    },
    actions: {
        // 初始化store
        initialize() {
            if (this.changCiList.length === 0) {
                this.createNewChangCi('初始场次')
            }
            if (this.currentChangCi) {
                this.currentZodiacData = this.currentChangCi.zodiacData
            } else {
                this.currentZodiacData = []
            }
        },
        // 创建新场次
        createNewChangCi(name: string) {
            const newId = this.changCiList.length > 0
                ? Math.max(...this.changCiList.map(item => item.id)) + 1
                : 1

            const newChangCi: ChangCiItem = {
                id: newId,
                name,
                createdAt: new Date(),
                zodiacData: JSON.parse(JSON.stringify(zodiacDataArray)),// 深拷贝初始数据
                pingMaBeilv: this.morenPingMaBeiLv,
                teMaBeilv: this.morenTeMaBeiLv,
                pingMaList: [],
                teMa: '',
                total: 0,
                peiTotal: 0,
                operateHistory: []
            }
            this.changCiList.push(newChangCi)
            this.currentChangCiId = newId
            this.currentZodiacData = newChangCi.zodiacData
        },

        // 切换当前场次
        setCurrentChangCi(id: number) {
            const changCi = this.changCiList.find(item => item.id === id)
            if (changCi) {
                this.currentChangCiId = id
                this.currentZodiacData = changCi.zodiacData
            }
        },

        /**
         * 更新单个号码的投注额
         * @param number 号码，如 '01'
         * @param amount 要增加的金额（可为负数）
         */
        updateNumberBet(number: string, amount: number) {
            const item = this.currentZodiacData.find(item => item.number === number)
            console.log(item)
            if (item) {
                // 记录旧值
                const oldTotal = item.total
                const zodiacName = item.name
                // 更新投注额
                item.total = Math.max(0, item.total + amount)
                // 检查是否有实际变化（排除0金额变化）
                if (amount !== 0) {
                    // 添加操作记录
                    this.addOperationRecord({
                        type: amount > 0 ? 'bet' : 'reduce',
                        typeText: amount > 0 ? '下注' : '减注',
                        title: amount > 0 ? '号码下注' : '号码减注',
                        description: `${amount > 0 ? '下注' : '减注 '} ${zodiacName}${number} 号 ${Math.abs(amount)}元`,
                        details: {
                            number,
                            amount,
                            total: item.total, // 更新后的总金额
                            oldTotal,         // 更新前的总金额
                            zodiac: zodiacName,
                            operator: '用户' // 可以根据实际情况获取当前操作人
                        }
                    })
                }
                this.updateWinningNumbers()
            }
        },

        /**
         * 更新特定生肖所有号码的投注额
         * @param zodiacName 生肖名称，如 '子鼠'
         * @param amount 要增加的金额（可为负数）
         * @param specificNumber 可选，只更新该生肖下的特定号码
         */
        updateZodiacBet(zodiacName: string, amount: number, specificNumber?: string) {
            // 获取该生肖下的所有号码
            const zodiacNumbers = this.currentZodiacData
                .filter(item => item.name === zodiacName)
                .map(item => item.number);

            // 记录被修改的号码及其旧值
            const modifiedItems: Array<{
                number: string;
                oldTotal: number;
                newTotal: number;
            }> = [];

            // 更新投注额并记录变更
            this.currentZodiacData.forEach(item => {
                if (item.name === zodiacName &&
                    (!specificNumber || item.number === specificNumber)) {

                    // 记录旧值
                    modifiedItems.push({
                        number: item.number,
                        oldTotal: item.total,
                        newTotal: Math.max(0, item.total + amount)
                    });

                    // 更新金额
                    item.total = Math.max(0, item.total + amount);
                }
            });

            // 如果没有实际修改，则不记录
            if (modifiedItems.length === 0 || amount === 0) {
                this.updateWinningNumbers();
                return;
            }

            // 判断是包生肖还是单号操作
            const isFullZodiacBet = !specificNumber &&
                modifiedItems.length === zodiacNumbers.length &&
                amount > 0;

            // 添加操作记录
            this.addOperationRecord({
                type: isFullZodiacBet ? 'zodiac' : (amount > 0 ? 'bet' : 'reduce'),
                typeText: isFullZodiacBet ? '包生肖' : (amount > 0 ? '下注' : '减注'),
                title: isFullZodiacBet ? '生肖包投' :
                    (amount > 0 ? '生肖下注' : '生肖减注'),
                description: isFullZodiacBet
                    ? `包${zodiacName} ${zodiacNumbers} 各${amount}元`
                    : `${amount > 0 ? '下注' : '减注'} ${specificNumber || zodiacName} ${Math.abs(amount)}元`,
                details: {
                    zodiac: zodiacName,
                    amount,
                    isFullZodiac: isFullZodiacBet,
                    numbers: specificNumber ? [specificNumber] : zodiacNumbers,
                    modifiedItems,
                    operator: '用户' // 可根据实际情况获取当前操作人
                }
            });

            this.updateWinningNumbers();
        },
        // 添加操作记录
        addOperationRecord(record: Omit<OperationRecord, 'time'>) {
            if (!this.currentChangCi) return

            if (!this.currentChangCi.operateHistory) {
                this.currentChangCi.operateHistory = []
            }

            this.currentChangCi.operateHistory.unshift({
                ...record,
                time: new Date()
            })

            // 限制历史记录数量
            if (this.currentChangCi.operateHistory.length > 500) {
                this.currentChangCi.operateHistory = this.currentChangCi.operateHistory.slice(0, 500)
            }
        },
        //更新默认倍率
        updateDefaultBeiLv(pingMaBeiLv: number, teMaBeiLv: number) {
            this.morenPingMaBeiLv = pingMaBeiLv
            this.morenTeMaBeiLv = teMaBeiLv
        },
        // 更新赔率并记录操作
        updateBeilv(pingMa: number, teMa: number) {
            const current = this.currentChangCi
            if (current) {
                // 记录旧赔率值
                const oldPingMa = current.pingMaBeilv
                const oldTeMa = current.teMaBeilv

                // 更新赔率
                current.pingMaBeilv = pingMa
                current.teMaBeilv = teMa

                // 添加操作记录
                this.addOperationRecord({
                    type: 'odds',
                    typeText: '赔率设置',
                    title: '更新赔率设置',
                    description: `平码: x${oldPingMa} → x${pingMa} | 特码: x${oldTeMa} → x${teMa}`,
                    details: {
                        pingMa,
                        teMa,
                        oldPingMa,
                        oldTeMa,
                        operator: '管理员' // 可以根据实际情况获取当前操作人
                    }
                })
            }
            this.updateWinningNumbers()
        },
        // 新增：更新总投注和总赔付
        updateTotals() {
            const current = this.currentChangCi
            if (!current) return

            // 计算总投注
            current.total = this.currentZodiacData.reduce((sum, item) => sum + item.total, 0)

            // 按生肖统计（可选）
            current.zodiacTotals = this.currentZodiacData.reduce((acc, item) => {
                acc[item.name] = (acc[item.name] || 0) + item.total
                return acc
            }, {} as Record<string, number>)

            // 更新赔付
            this.updateWinningNumbers()
        },
        updateWinningNumbers() {
            const current = this.currentChangCi;
            if (!current) return;
            let totalPei = 0
            let total = 0
            current.zodiacData.forEach(item => {
                // 判断中奖类型
                if (item.number === current.teMa) {
                    item.beilv = current.teMaBeilv;  // 特码赔率
                } else if (current.pingMaList.includes(item.number)) {
                    item.beilv = current.pingMaBeilv; // 平码赔率
                } else {
                    item.beilv = 0;   // 未中奖
                }
                // 计算单个号码赔付
                item.peiTotal = item.total * (item.beilv || 0)
                totalPei += item.peiTotal
                total += item.total
            });

            // 更新场次总赔付
            current.peiTotal = totalPei
            current.total = total
            this.currentZodiacData = current.zodiacData
        },
        /**
         * 计算当前场次的总赔率
         */
        calculateTotalPei(): number {
            return this.currentZodiacData.reduce((sum, item) => {
                return sum + (item.peiTotal || 0);
            }, 0);
        },

        /**
         * 获取单个号码的赔率总额
         */
        getPeiTotalByNumber(number: string): number {
            const item = this.currentZodiacData.find(
                item => item.number === number
            );
            return item ? (item.peiTotal || 0) : 0;
        },

        /**
         * 获取特定生肖的总赔率
         */
        getPeiTotalByZodiac(zodiacName: string): number {
            return this.currentZodiacData
                .filter(item => item.name === zodiacName)
                .reduce((sum, item) => sum + (item.peiTotal || 0), 0);
        },
        deleteChangCi(id: number) {
            this.changCiList = this.changCiList.filter(item => item.id !== id)
            if (this.currentChangCiId === id) {
                this.currentChangCiId = this.changCiList[0]?.id || 0
            }
        },
        renameChangCi(id: number, newName: string) {
            const changCi = this.changCiList.find(item => item.id === id)
            if (changCi) changCi.name = newName
        },
        /**
         * 导入场次数据
         * @param importedData 导入的数据对象
         * @param options 导入选项
         */
        importChangCi(importedData: any, options: {
            overwrite?: boolean,   // 覆盖现有场次
            merge?: boolean  //合并
        } = {}) {
            try {
                // 验证数据格式
                if (!validateImportData(importedData)) {
                    Snackbar.error('导入失败: 数据格式不正确')
                    return false
                }
                // 处理重复场次
                const existingIndex = this.changCiList.findIndex(
                    item => item.id === importedData.id
                )

                if (existingIndex >= 0) {
                    if (options.overwrite) {
                        // 覆盖现有场次
                        this.changCiList[existingIndex] = importedData
                        Snackbar.success(`成功覆盖场次: ${importedData.name}`)
                    } else if (options.merge) {
                        // 合并数据
                        mergeChangCi(this.changCiList[existingIndex], importedData)
                        Snackbar.success(`成功合并到场次: ${importedData.name}`)
                    } else {
                        // 创建新场次避免冲突
                        importedData.id = Math.max(...this.changCiList.map(i => i.id)) + 1
                        importedData.name = `${importedData.name}_导入`
                        importedData.createdAt = new Date()
                        this.changCiList.push(importedData)
                        Snackbar.success(`导入为新场次: ${importedData.name}`)
                    }
                } else {
                    // 直接添加新场次
                    this.changCiList.push(importedData)
                    Snackbar.success(`成功导入场次: ${importedData.name}`)
                }
                // 更新当前场次
                if (this.currentChangCiId === importedData.id) {
                    this.currentZodiacData = importedData.zodiacData
                }

                return true
            } catch (error) {
                console.error('导入失败:', error)
                Snackbar.error('导入失败: ' + error.message)
                return false
            }
        },
        clearAllChangCi() {
            this.changCiList = []
            this.currentChangCiId = 0
            this.currentZodiacData = []
            // 如果有其他需要重置的状态也可以在这里重置
        }

    },
    // 持久化配置
    persist:
        {
            storage: process.client ? localStorage : undefined,

        }
})

/**
 * 验证导入数据格式
 */
function validateImportData(data: any): boolean {
    const requiredFields = [
        'id', 'name', 'createdAt',
        'zodiacData', 'pingMaList', 'teMa',
        'pingMaBeilv', 'teMaBeilv'
    ]

    return requiredFields.every(field => field in data)
}

/**
 * 合并两个场次数据
 */
function mergeChangCi(target: ChangCiItem, source: ChangCiItem) {
    // 合并投注数据
    source.zodiacData.forEach(sourceItem => {
        const targetItem = target.zodiacData.find(
            item => item.number === sourceItem.number
        )

        if (targetItem) {
            targetItem.total += sourceItem.total
            targetItem.peiTotal += sourceItem.peiTotal || 0
        } else {
            target.zodiacData.push(sourceItem)
        }
    })

    // 合并平码列表(去重并限制最多6个)
    const mergedPingMa = [...new Set([
        ...target.pingMaList,
        ...source.pingMaList
    ])]
    target.pingMaList = mergedPingMa.slice(0, 6) // 只保留前6个

    // 保留最新的特码
    if (new Date(source.createdAt) > new Date(target.createdAt)) {
        target.teMa = source.teMa
    }

    // 使用更高的赔率
    target.pingMaBeilv = Math.max(
        target.pingMaBeilv,
        source.pingMaBeilv
    )
    target.teMaBeilv = Math.max(
        target.teMaBeilv,
        source.teMaBeilv
    )
}