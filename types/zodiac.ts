//zodiac.ts

// 定义单个号码项的接口
export interface ZodiacNumberItem {
    number: string;       // 号码，如 '01', '02'...'49'
    name: string;         // 生肖名称，如 '巳蛇', '辰龙'
    total: number;       // 总金额，初始为0
    beilv?: number;      // 赔率，可选属性，0=未中，2=平马，47=特码
    peiTotal?: number;
}

// 定义整个数组的类型
export type ZodiacDataArray = ZodiacNumberItem[];


//场次
export interface ChangCiItem {
    id: number
    name: string
    createdAt: Date
    zodiacData: ZodiacDataArray
    pingMaList: Array<string>
    teMa: string
    pingMaBeilv?: number
    teMaBeilv?: number
    total?: number,
    peiTotal?: number,
    operateHistory:[]
}

export interface MainStoreState {
    currentChangCiId: number
    changCiList: ChangCiItem[]
    currentZodiacData: ZodiacDataArray
}

/**
 * 操作记录类型定义
 */
export interface OperationRecord {
  type?: string;
  typeText?: string;
  title?: string;
  description?: string;
  timestamp?: number;
  details?: {
    pingMa?: number;
    teMa?: number;
    oldPingMa?: number;
    oldTeMa?: number;
    operator?: string;
    [key: string]: any;
  };
  status?: 'success' | 'failed' | 'pending';
  ipAddress?: string;
  deviceInfo?: {
    os?: string;
    browser?: string;
    device?: string;
  };
}

