---
title: git日常使用
slug: gti
description: 工程开发过程中常用指令及常遇到的问题总结，满足日常开发使用。
category: 教程&问题
date: 2026-11-19
tags:
  - git使用
  - 工程开发
  - 问题及解决
---


# Git 分支创建到合并：简明流程

> 假设主分支为 `main`，功能分支为 `feat/new-feature`，远程仓库为 `origin`。

## 1. 更新主分支

```bash
git status                         # 确认工作区干净
git switch main                    # 切换主分支
git pull --ff-only origin main     # 拉取最新代码
```

## 2. 创建功能分支

```bash
git switch -c feat/new-feature     # 创建并切换分支
```

## 3. 开发并提交代码

```bash
# 修改代码并完成测试
git status                         # 查看修改
git add .                          # 暂存当前目录的修改
git commit -m "feat: add new feature"  # 提交改动
```

## 4. 推送功能分支（可选，推荐）

```bash
git push -u origin feat/new-feature  # 首次推送，建立上游关联
```

## 5. 合并回主分支

```bash
git switch main                    # 切回主分支
git pull --ff-only origin main     # 确保 main 最新
git merge --no-ff feat/new-feature # 合并功能分支
# 检查结果、运行测试
git push origin main               # 推送主分支
```

## 6. 删除已合并分支

```bash
git branch -d feat/new-feature             # 删除本地分支
git push origin --delete feat/new-feature  # 删除远程分支（如果已推送）
```

## 出现冲突怎么办？

```bash
git status                  # 查找冲突文件
# 手动编辑冲突文件，保留正确内容
git add <冲突文件>           # 标记冲突已解决
git merge --continue        # 完成合并
# 然后重新测试，再推送
```

不想继续本次合并时，可在合并未完成前使用 `git merge --abort`。

**注意：** 每一步报错都应先解决再继续；合并前确保工作区干净。多人协作时，推荐推送功能分支后在 GitHub 创建 Pull Request，由代码审查通过后合并到 `main`，不要再重复执行本地合并流程。