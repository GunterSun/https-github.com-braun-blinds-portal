# 加工制作图纸 V1 / Manufacturing Drawing V1

## 数据来源 / Source of truth

加工图不得重新输入现场尺寸。尺寸必须来自真实 `Window ID` 的一个明确 `Measurement Version`。

Manufacturing drawings must not re-key field dimensions. Dimensions come from one explicit Measurement Version of a real Window ID.

## V1 流程 / Workflow

1. Property / 房屋项目
2. Room / 房间
3. Window ID + Window Code / 窗位
4. Measurement Version / 测量版本
5. 1/16-inch measurement values / 1/16 英寸尺寸
6. Site photo count and notes / 现场照片数量与备注
7. Production requirements / 加工要求
8. Print / Save PDF / 打印或保存 PDF

## 生产字段 / Production fields

- Fabric or material code / 面料或材料代码
- Product code / 产品代码
- Quantity / 数量
- Direction / 方向
- Seam / 拼接
- Lining / 衬布
- Track, rod and hardware / 轨道、杆和五金
- Motor and control / 电机与控制
- Special manufacturing instructions / 特殊加工说明

## 安全规则 / Safety rules

- No fallback to another Window when the selected Window has no measurement revision.
- 不允许因为当前窗位没有测量版本而自动使用其他窗位。
- Printed drawing must identify Window ID, Window Code and Measurement Version.
- 打印图纸必须显示 Window ID、窗位代码和 Measurement Version。
- Production staff must verify the exact Window and measurement revision before manufacturing.
- 生产前必须核对准确窗位和测量版本。

## V2

Persist/version drawings in D1, approval/supersede workflow, factory assignment, Work Order generation, and installation handoff.

V2 将增加 D1 图纸版本化、批准/替代、多工厂分配、工厂 Work Order 和安装任务交接。