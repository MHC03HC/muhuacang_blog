---
title: markdown文件使用教程
slug: markdown
description: 整理md文件中常用板块。
category: 使用教程
updated: 2026-11-19
tags:
  - markdown
  - 学习笔记
---

# md文件使用方法
在 VS Code 中，Markdown（`.md`）主要用于编写项目说明、学习笔记、技术文档和 README 文件。它通过简单的标记语法实现标题、列表、代码块、表格、图片等排版效果。

对于你目前使用的 Ubuntu + VS Code 环境，下面介绍最常用的操作。

## 一、创建和预览 Markdown 文件

### 1. 创建文件

在 VS Code 中：

1. 按 `Ctrl + N` 新建文件。
2. 按 `Ctrl + S` 保存。
3. 文件名输入 `notes.md` 或 `README.md`。

### 2. 打开 Markdown 预览

打开预览

在当前编辑器中预览 Markdown 渲染结果。

`Ctrl + Shift + V`

侧边预览（推荐）

左边写 Markdown，右边实时查看排版效果。

`Ctrl + K` 然后 `V`

切换自动换行

长段落自动在编辑器宽度内换行。

`Alt + Z`

[juejin.cn](https://juejin.cn/post/7015239119072673799?utm_source=chatgpt.com)

## 二、Markdown 常用语法

| 功能   | Markdown 写法 | 说明    |
| ---- | ----------- | ----- |
| 一级标题 | `# 标题`      | 最大标题  |
| 二级标题 | `## 标题`     | 章节标题  |
| 三级标题 | `### 标题`    | 小节标题  |
| 加粗   | `**文字**`    | 文字    |
| 斜体   | `*文字*`      | 文字    |
| 删除线  | `~~文字~~`    | 文字    |
| 无序列表 | `- 内容`      | 项目符号  |
| 有序列表 | `1. 内容`     | 自动编号  |
| 行内代码 | `` `代码` ``  | `代码`  |
| 引用   | `> 内容`      | 引用块   |
| 分割线  | `---`       | 水平分割线 |
| 复制块  | ````     | 复制方块 |

### 1. 插入代码块

由于你现在正在学习 C++，这部分会经常用到。

Markdown 源码：

````
## C++ 示例

下面是一个简单的 C++ 程序：

```cpp
#include <iostream>
using namespace std;

int main() {
    cout << "Hello World!" << endl;
    return 0;
}
```
````

渲染效果：

```
#include <iostream>
using namespace std;

int main() {
    cout << "Hello World!" << endl;
    return 0;
}
```

其中 `cpp` 表示 C++ 语言，VS Code 会自动进行代码语法高亮。Python 则可以写成 `python`，Shell 命令可以写成 `bash`。

### 2. 插入图片和链接

```
[访问 GitHub](https://github.com)

![程序流程图](./images/flowchart.png)
```

图片路径 `./images/flowchart.png` 表示 Markdown 文件所在目录下的 `images` 文件夹中的 `flowchart.png` 图片。

### 3. 插入表格

```
| 算法 | 主要特点 |
|---|---|
| PPO | On-policy |
| SAC | Off-policy |
| TD3 | 双 Critic |
```

预览效果：

| 算法  | 主要特点       |
| --- | ---------- |
| PPO | On-policy  |
| SAC | Off-policy |
| TD3 | 双 Critic   |

### 4. 插入数学公式

Markdown 预览支持常用的 LaTeX 数学公式语法。

行内公式：

```
$Q(s,a)$
```

独立公式：

```
$$
Q(s,a)=r+\gamma\max_{a'}Q(s',a')
$$
```
### 5.插入小标题
# C++基础

1. 变量
- 变量的定义
- 变量的命名规则
- 变量的初始化
  - 直接初始化
  - 拷贝初始化
 
 2. 数据类型
1. 整型
2. 浮点型
3. 字符型
