# Braun Complete v3.0 源码完整性阻断报告 V1.5
日期：2026-10-09
状态：源码截断已在修复分支恢复（2026-10-10）；以下保留原始调查记录。

## 修复与验证（2026-10-10）
- 从 Git 历史提交 `e7b8689` 恢复 `public/complete/app.js`，原始 blob `5d3e68a432e1f44c6ccdc738498bd6a5bab12a89`，306980 bytes。该历史提交的 HTML/CSS 与报告时 main 一致，恢复的是匹配页面的完整程序，未改写报价公式。
- 新增构建前语法、文件体积及核心函数完整性检查，避免截断脚本再次发布。
- 修复手机导航遮挡、单列录入与表格横向滚动。浏览器已验证产品录入、价格计算及无运行错误；真实历史订单金额、Excel/Invoice/加工图所有导出分支仍需业务样本核对。
- Z 系列正式报价支持同一客户项目下 1–100 行、多窗位、多产品和供应商，保存逐行来源及不可变报价快照；服务端采用原有价格表计算。签字及账单同步关联全部窗位。
- 已验证重复请求幂等、跨客户/项目拒绝、非法尺寸/数量拒绝、客户权限以及报价→签字→账单流程。

## 发现（GitHub main 分支）
- `public/complete/app.js` 的 Git tree blob 大小 **32768 bytes**。
- GitHub 文件内容末尾在 `COMPACT_MATERIALS_DB` 一条 `DTW028-610N` 记录的 `"RP` 中间结束；既没有完成该字符串，也没有结束数组、闭合结构。
- `public/complete/index.html` 页面底部引用 `<script src="app.js"></script>`。
- `public/complete/README.txt` 声称支持报价、Invoice、加工图、测量 JSON 导入，但该脚本在当前仓库版本不具备完整执行所需的源码。
- 仓库 `main` 树中，排除 `xlsx.full.min.js` 后，只有这一份 `public/complete/app.js` 作为 Complete 主 JS；未发现另一个明显命名的 Complete 完整主脚本。不能据此推断用户本地或其他分支/历史提交中没有完整版本。
- `app/calculators/page.tsx` Braun 与 Jin 两个入口都指向 `/complete/index.html`。
- `public/z-roman/` 独立 Z 系列 JS 和 1.0–1.5 历史存档存在，勿因修复 Complete 而覆盖。

## 风险
`app.js` 在未闭合的字符串字面量中截断，浏览器解析将发生语法错误，进而阻断依赖该脚本的计算器交互。仅有 HTML 选项不等于对应报价计算功能正常。尚未进行浏览器端实测，因此不能声称部署线上也必然同一版本。

## 恢复及验收建议
1. 查找 Git 历史提交、其他分支、另一个私有仓库以及用户本地完整 Complete 程序 ZIP；按文件哈希、版本、修改日期比对。
2. 在**独立审核分支**恢复候选完整文件，不能覆盖原文件或直接改主分支。
3. 用 JavaScript 语法检查和浏览器测试验证页面加载、Roman/Drapery 切换、报价、Excel 导入、Invoice、加工图及测量 JSON。
4. 用真实 Jin/Braun 历史订单对照报价金额、120/244 高度规则、双层及客户折扣；不要把 Romalux 规则混入 Jin。
5. 找到完整源码并经业务审核后，再设计统一适配器及混合订单功能。

## 已确认的范围边界
本轮没有取得完整 Complete 计算公式，也没有验证 Romalux 原始矩阵。不得将历史口头规则冒充已在 GitHub 源码中实现。
