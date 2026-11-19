---
title: C++探索之旅
slug: cpp
description: 整理 C++ 在工程开发中的常用语法、调试经验和项目实践记录。
category: 编程语言
updated: 2026-11-17
tags:
  - C++
  - 工程开发
  - 学习笔记
---

# 1.初识C++
## 1.1书写Hello World

```cpp
#include <iostream>
using namespace std;

int main() {
    cout << "Hello World!" << endl;
    return 0;
}
```

## 1.2变量
变量创建语法：数据类型 变量名 = 变量初始值;
 ```cpp
 #include <iostream>
using namespace std;
int main(){
    int a = 10;
    cout << "a = " << a << endl;
    return 0;
}
```

## 1.3常量
#define宏常量,不可以修改；const修饰的变量
```cpp
#include <iostream>
using namespace std;
#define Day 7
int main() {
    const int week = 7;//变量是可以修改的，但是const修饰的变量是不能修改的
    cout << "一周有： " << Day<< " 天" << endl;
    cout << "一周有： " << week<< " 天" << endl;
    return 0;
}
```
## 1.4关键字
![C++ 关键字表](/images/wiki/cpp/keyboard.png)

## 1.5标识符名规则
- 标识符不能是关键字
- 标识符只能由字母、数字、下划线组成
- 第一个标识符必须为字母或者下划线
- 标识符中字母区分大小写

# 2.数据类型
意义：给变量分配合适的内存空间

## 2.1整型
| 数据类型 | 占用空间 | 取值范围 |
|---|---|---|
| short（短整型） | 2字节 | -2^15~2^15-1 |
| int | 4字节 | -2^31~2^31-1 |
| long | windows为4字节，linux为4字节（32位），8字节（64位） | -2^31~2^31-1 |
| long long | 8字节 | -2^63~2^63-1 |

## 2.2sizeof关键字
统计数据类型所占内存的大小
sizeof(数据类型/变量名)
```cpp
#include<iostream>
using namespace std;
int main(){
    short name = 10;
    cout<<"short占用内存大小为："<<sizeof(name)<<endl;
    return 0
}
```
## 2.3浮点型
用来表示小数默认情况下会显示六位有效数字
| 数据类型 | 占用空间 | 有效范围 |
|---|---|---|
| float | 4字节 | 7位有效数字 |
| double | 8字节 | 15~16位有效数字 |
```cpp
using namespace std;
int main(){
    float f1 = 10.22;
    cout<<f1<<endl;
    //科学计数法
    float f2 = 1.23e-4;//1.23*10^-4
    cout<<f2<<endl;
    float f3 = 1.23e4;//1.23*10^4
    cout<<f3<<endl;
    return 0;
}
```
## 2.4字符型
字符变量用于显示单个字符
语法：` char ch = 'a' `
- C/C++中字符型变量只占用一个字节
- 字符型变量并不是把字符本身放到内存存储中，而是将对应的ASCLL放到存储单元
- 创建字符型变量的时候不能使用双引号
- 创建字符型变量的时候，单引号内只能有一个字符。错误：`char ch2 = 'asdf'`
```cpp
#include<iostream>
using namespace std;
int main(){
  char grade = 'A';
  cout << "grade = " << grade << endl;
  cout << "grade的ASCII值 = " << (int)grade << endl;//将grade强制转换为int类型，输出其ASCII值
    return 0;
}
```

## 2.5转义字符
| 转义字符 | 含义 |
|---|---|
| \n | 换行，将当前位置移到下一行开头 |
| \t | 水平制表符 |
| \\ | 代表一个反斜线字符“\” |
```cpp
#include<iostream>
using namespace std;
int main(){
//换行符
    cout << "Hello\nWorld" << endl;
    cout << "Hello World\n";
//反斜杠
    cout << "Hello World\\" << endl;
//水平制表符，对齐机制，一般为8个空格
    cout << "Hello0000\tWorld" << endl;
    cout << "Hello000\tWorld" << endl;
    return 0;
}
```
## 2.6字符串型
表示一串字符
` char 变量名[] = "字符串值" `
字符串是双引号，字符型是单引号
```cpp
#include<iostream>
using namespace std;
#include<string>//使用C++风格字符串需要包含<string>头文件
int main(){
//C风格字符串
char str[] = "Hello, World!";//双引号
char ch = 'A';//单引号
    cout << str << endl;
    cout << "字符ch = " << ch << endl;
//C++风格字符串
    string s = "Hello, World!";
    cout << s << endl;
    return 0;
}
```

## 2.7布尔类型bool
代表真或假
```cpp
#include<iostream>
using namespace std;
int main(){
    bool flag = true;
    cout << "布尔值flag = " << flag << endl;
    cout << "布尔值flag的大小 = " << sizeof(flag) << " 字节" << endl;
    flag = false;
    cout << "布尔值flag = " << flag << endl;

    return 0;
}
```

## 2.8数据输入
语法：`cin >> 变量`
```cpp
#include<iostream>
using namespace std;
int main(){
   //整型
   int a ;
   cin >> a;
   cout << "整数a = " << a << endl;
   //浮点型
    float b ;
    cin >> b;
    cout << "浮点数b = " << b << endl;
   //字符型
    char c ;
    cin >> c;
    cout << "字符c = " << c << endl;
   //字符串型
    char str[100];//在 char str[100]; 中填写 100，是因为 C++ 编译器需要在程序运行前预先在内存（栈区）中划定一块固定大小的空间（100 个字节），用来存放后续用户输入的字符。
    cin >> str;
    cout << "字符串str = " << str << endl;
   //布尔型
    bool d ;
    cin >> d;
    cout << "布尔值d = " << d << endl;
    return 0;
}
```
# 3.运算符
## 3.1算数运算符
| 运算符 | 名称 | 作用说明 | 示例 (`a=10, b=3`) | 运算结果 |
| --- | --- | --- | --- | --- |
| `+` | 加法 / 正号 | 两数相加，或表示正值 | `a + b` | 13 |
| `-` | 减法 / 负号 | 两数相减，或数值取反 | `a - b` | 7 |
| `*` | 乘法 | 计算两数乘积 | `a * b` | 30 |
| `/` | 除法 | 两数相除（整数除整数向下取整） | `a / b` | 3 |
| `%` | 取模（求余） | 计算两整数相除的余数 | `a % b` | 1 |
| `++` | 前置自增 | 先将变量加 1，再使用变量值 | `++a` | 11 |
| `++` | 后置自增 | 先使用变量原值，再将变量加 1 | `a++` | 10（运算后 `a` 变为 11） |
| `--` | 前置自减 | 先将变量减 1，再使用变量值 | `--b` | 2 |
| `--` | 后置自减 | 先使用变量原值，再将变量减 1 | `b--` | 3（运算后 `b` 变为 2） |

**核心注意事项**

* **整数除法截断**：当 `/` 两侧均为整型时，结果会直接舍弃小数部分（如 `10 / 3` 结果为 3）。若需保留小数，至少要让其中一个操作数为浮点型（如 `10.0 / 3`）。
* **取模限制**：`%` 运算符的操作数**必须全部为整数类型**（如 `int`、`long`），浮点数不能直接使用 `%`（浮点数求余需使用 `<cmath>` 中的 `fmod` 函数）。
* **除零错误**：`/` 和 `%` 的右操作数绝不能为 0，否则会导致程序运行崩溃（未定义行为）。

## 3.2赋值运算符

| 运算符 | 名称 | 等价展开式 | 示例 (`a = 10` 独立计算) | 运算后 `a` 的值 |
| --- | --- | --- | --- | --- |
| `=` | 基本赋值 | — | `a = 5` | 5 |
| `+=` | 加法赋值 | `a = a + b` | `a += 3` | 13 |
| `-=` | 减法赋值 | `a = a - b` | `a -= 3` | 7 |
| `*=` | 乘法赋值 | `a = a * b` | `a *= 3` | 30 |
| `/=` | 除法赋值 | `a = a / b` | `a /= 3` | 3 |
| `%=` | 取模赋值 | `a = a % b` | `a %= 3` | 1 |
| `&=` | 按位与赋值 | `a = a & b` | `a &= 3` | 2 |
| `\|=` | 按位或赋值 | `a = a \| b` | `a \|= 3` | 11 |
| `^=` | 按位异或赋值 | `a = a ^ b` | `a ^= 3` | 9 |
| `<<=` | 左移赋值 | `a = a << b` | `a <<= 2` | 40 |
| `>>=` | 右移赋值 | `a = a >> b` | `a >>= 2` | 2 |

**核心注意事项**

* **右侧表达式整体优先**：复合赋值运算符会将右侧整个表达式视为一个整体（相当于自动加了括号）。例如 `a *= 2 + 3` 等价于 `a = a * (2 + 3)`（结果为 50），而**不是** `a * 2 + 3`（23）。
* **右结合性（支持连等）**：赋值运算符是**从右向左**计算的。例如 `a = b = 5;` 会先执行 `b = 5`，然后将表达式的返回值赋给 `a`。
* **左值要求**：赋值运算符的左侧必须是一个**可修改的左值**（如普通变量），不能是常量、字面量或计算表达式（如 `5 = a` 或 `a + b = 10` 会导致编译报错）。
* **区分赋值 `=` 与相等 `==**`：在 `if (a = 5)` 中写单个等号会将 `5` 赋给 `a` 且条件永远为真；判断相等必须使用双等号 `==`。

## 3.3比较运算符
| 运算符 | 名称 | 作用说明 | 示例 (`a = 10, b = 3`) | 运算结果 |
| --- | --- | --- | --- | --- |
| `==` | 相等于 | 判断两值是否相等 | `a == b` | `false` (0) |
| `!=` | 不等于 | 判断两值是否不相等 | `a != b` | `true` (1) |
| `>` | 大于 | 判断左值是否大于右值 | `a > b` | `true` (1) |
| `<` | 小于 | 判断左值是否小于右值 | `a < b` | `false` (0) |
| `>=` | 大于等于 | 判断左值是否大于或等于右值 | `a >= b` | `true` (1) |
| `<=` | 小于等于 | 判断左值是否小于或等于右值 | `a <= b` | `false` (0) |
| `<=>` | 三路比较 (C++20) | 同时比较两值的大小关系（太空船运算符） | `a <=> b` | 大于 0 的比较类别对象 |

**核心注意事项**

* **返回值类型**：前 6 种传统比较运算符的结果均为布尔类型（`bool`），条件成立返回 `true`（转为整数是 1），不成立返回 `false`（转为整数是 0）。
* **切勿支持数学连写**：C++ **不支持** `1 < a < 5` 这种数学区间写法。编译器会从左向右先算 `1 < a` 得到布尔值 `0` 或 `1`，然后再用 `0` 或 `1` 与 `5` 比较（结果永远为真）。正确写法必须用逻辑与连接：`a > 1 && a < 5`。
* **浮点数不可直接用 `==` 比较**：由于 `float` 和 `double` 在内存中存在精度误差（如 `0.1 + 0.2` 实际上可能等于 `0.30000000000000004`），判断两个浮点数是否相等时，应判断它们的差值绝对值是否小于一个极小值：`std::abs(x - y) < 1e-6`。
* **C 风格字符串比较陷阱**：如果对两个 `char[]` 数组或 `char*` 指针直接使用 `str1 == str2`，比较的是它们在内存中的**首地址**是否相同，而不是内容是否相同。比较 C 风格字符串内容需用 `strcmp(str1, str2) == 0`，或者直接使用支持 `==` 的 `std::string`。

## 3.4逻辑运算符
| 运算符 | 名称 | 关键字写法 | 作用说明 | 示例 (`a = true, b = false`) | 运算结果 |
| --- | --- | --- | --- | --- | --- |
| `!` | 逻辑非 | `not` | 条件取反：真变假，假变真 | `!a` | `false` (0) |
| `&&` | 逻辑与 | `and` | 同真为真，一假则假 | `a && b` | `false` (0) |
| `\|\|` | 逻辑或 | `or` | 一真则真，同假为假 | `a \|\| b` | `true` (1) |

**核心注意事项**

* **短路求值（Short-circuit evaluation）**：
* **逻辑与 `&&`**：如果左侧表达式为 `false`，整个结果必定为假，C++ **不会再去计算右侧表达式**。常用于防崩溃检查，如 `if (ptr != nullptr && *ptr > 0)`。
* **逻辑或 `||`**：如果左侧表达式为 `true`，整个结果必定为真，C++ **同样不会计算右侧表达式**。若右侧带有自增（如 `a || ++b`），`++b` 将不会被执行。


* **非零即真（隐式转换）**：逻辑运算符的操作数不一定非得是 `bool` 类型。在 C++ 中，任何**非 0** 的数值或非空指针都会被视为 `true`，只有数值 **0**（或 `nullptr`、`'\0'`）会被视为 `false`。例如 `!5` 的结果是 `false` (0)，`!0` 的结果是 `true` (1)。
* **运算优先级**：`!`（逻辑非）高于 `&&`（逻辑与），`&&` 高于 `||`（逻辑或）。例如 `a || b && c` 等价于 `a || (b && c)`。在复杂条件中建议直接加括号以保证可读性。
* **切勿与按位运算符混淆**：`&&` 和 `||` 是逻辑运算符（结果只有 `true`/`false`，且有短路特性）；而单个符号的 `&`（按位与）和 `|`（按位或）是对二进制位逐位运算，**没有短路特性**，两侧表达式永远都会被执行。

# 4.程序流程结构

## 4.1选择结构

### 4.1.1 if语句
- if 语句：`if(条件){条件满足执行的语句}else if（条件2）{条件2满足执行的语句}else{条件不满足执行的语句}`
```cpp
#include<iostream>
using namespace std;
int main(){
    int a;
    cin >> a;
    if(a>480){
        cout << "考上大学" << endl;
    }
    else{
        cout << "没考上大学" << endl;
    }
    return 0;
}
```
- 嵌套if语句
```cpp
#include<iostream>
using namespace std;
int main(){
    int a;
    cin >> a;
    if(a>500){
        cout << "考上大学" << endl;
        if(a>600){
            cout << "考上985" << endl;
        }
        else{
            cout << "没考上985" << endl;
        }
    }
    else{
        cout << "没考上大学" << endl;
    }
    return 0;
}
```
### 4.1.2三目运算符
**语法**：`表达式1 ？ 表达式2 ： 表达式3`
如果表达式1的值为真，执行表达式2，并返回表达式2的值
如果表达式1的值为假，执行表达式3，并返回表达式3的值
```cpp
#include<iostream>
using namespace std;
int main(){
    int a=10,b=20,c=30;
    int d=a>b? (a>c?a:c) : (b>c?b:c);
    cout<<"最大值为："<<d<<endl;
    return 0;
}
```

### 4.1.3switch语句
swich在判断的时候只能是整型或者字符型，不可以是一个区间
```cpp
#include<iostream>
using namespace std;
int main(){
    cout << "请给电影打分" << endl;
    int score;
    cin >> score;
    cout << "您给电影打的分是：" << score << endl;
    switch(score){
        case 10:
            cout << "太棒了" << endl;
            break;//退出当前分支
        case 9:
            cout << "非常好" << endl;
            break;
        case 8:
            cout << "很好" << endl;
            break;
        case 7:
            cout << "还行" << endl;
            break;
        case 6:
            cout << "一般" << endl;
            break;
        default:
            cout << "不及格" << endl;
    }
    return 0;
}
```

## 4.2循环结构
### 4.2.1while循环
**语法**：`while(循环条件){循环语句} `
```cpp
#include<iostream>
using namespace std;
int main(){
    int num = 0;
    while(num < 10){
        cout << "num = " << num << endl;
        num++;
    }
    return 0;
}
```
### 4.2.2do...while语句
**语法**：`do{循环语句}while(循环条件)`
与while的区别思do...while会先执行一次循环语句在进行判断
```cpp
using namespace std;
int main(){
    int num;
    num = 0;
    do{
        cout<<num<<endl;
        num++;
    }
    while(num);
    while(num)  {
       cout<<num<<endl;
        num++; 
    }
    return 0;
}   
```

### 4.2.2for循环语句
**语法**：`for(起始表达式；条件表达式；末尾循环体){循环语句}`
```cpp
#include<iostream>
using namespace std;
int main(){
    for (int i = 0; i < 5; i++) {
        cout << "i = " << i << endl;
    }
    return 0;
}   
```
### 4.2.2嵌套循环
```cpp
#include<iostream>
using namespace std;
int main(){
    //外层执行一次，内层执行一周
    //外层循环
    for (int i = 1; i < 10; i++) {
        //内层循环
        for (int j = 0; j < 10-i; j++) {
            cout << "*";
        }        cout << endl;
    }
    return 0;
}   
```
## 4.3跳转语句
**作用**:用于跳出选择结构或者循环结构
break使用的时机:
- 出现在switch条件语句中，作用是终止case并跳出switch
- 出现在循环语句中，作用是跳出当前的循环语句
- 出现在嵌套循环中，跳出最近的内层循环语句

### 4.3.2 continue语句
**作用**:在循环语句中，跳过本次循环中余下尚未执行于的语句，继续执行下一次循环

### 4.3.3goto语句
**作用**:可以无条件跳转语句
**语法**:`goto 标记`
**解释**:如果标记的名称存在，执行到goto语句时，会跳转到标记的位置
```cpp
int main() {
    cout << "1" << endl;
    goto tag;
    cout << "2" << endl;
    cout << "3" << endl;
    cout << "4" << endl;
    tag:
    cout << "5" << endl;
```

# 5数组
一个集合中存放了**相同数据类型**的数据元素
数组是由连续的内存位置组成的

## 5.1一维数组array
- 数据类型 数组名[数组长度];
- 数据类型 数组名[数组长度]={值1，值2...};
- 数据类型 数组名[]{值1，值2...};
- 可以使用sizeof统计数组和数组中元素所占用的内存空间大小
- 通过数组名查看数组首地址`cout << (int)arr << endl`
- 数组中第一个元素的地址`cout << (int)&arr[0] << endl`//访问具体元素需要加取址符&
- 数组名是常量，不可以赋值
```cpp
//颠倒数组
#include<iostream>
using namespace std;
int main(){
    int arr[] ={1,2,3,4,5};
    int start = 0;
    int end = sizeof(arr)/sizeof(arr[0]) - 1;
    while(start < end){
        int temp = arr[start];
        arr[start] = arr[end];
        arr[end] = temp;
        start++;
        end--;
    }
    for(int i = 0; i<5 ; i++){
        cout<<arr[i]<<endl;
    }
    
    return 0;
}   
```
```cpp
//冒泡
#include<iostream>
using namespace std;
int main(){
    int arr[] ={1,5,7,2,9};
    for(int i = 0; i < 5; i++){
        for(int j = 0; j < 5 - i - 1; j++){
            if(arr[j] < arr[j + 1]){
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
    for(int i = 0; i < 5; i++){
        cout << arr[i] << " ";
    }
    return 0;
}   
```

## 5.2二维数组
- 数据类型 数组名[行数][列数];
- 数据类型 数组名[行数][列数]={{数据1，数据2}，{数据3，数据4}};
- 数据类型 数组名[行数][列数]={数据1，数据2，数据3，数据4};
- 数据类型 数组名  [] [列数]={数据1，数据2，数据3，数据4};
以上4种定义方式，利用第二种更加直观，提高代码的可读性

# 6.函数
封装代码，减少重复代码
函数的定义一般主要有5个步骤:
- 返回值类型
- 函数名
- 参数表列
- 函数体语句
- return 表达式
语法:
```cpp
返回值类型 函数名 (参数列表){
    函数体语句
    return表达式
}
``` 
```cpp
#include<iostream>
using namespace std;
int sum(int a, int b){
    return a+b;//函数定义中的参数为形参，在实参传入h之前没有值
}
int main(){
    int a=10;//实参
    int b=20;
    int add=sum(a,b);//存储调用函数结果的变量不能和函数名一致，例如int sum=sum(a,b)
    cout << "Sum: " << add << endl;

    return 0;
}   
```

```cpp
#include<iostream>
using namespace std;
//不需要返回值的时候使用void
void swap(int a, int b){
    int temp;
    temp=a;
    a=b;
    b=temp;
    cout << "After swapping: a=" << a << ", b=" << b << endl;
}
//形参值发生改变的时候不会影响实参
int main(){
    int a=10;
    int b=20;
    swap(a,b);
    cout << "In main function: a=" << a << ", b=" << b << endl;
    return 0;
}   
```
```cpp
#include<iostream>
using namespace std;
//函数声明
//声明可以写多次，定义只能写一次
int max(int a, int b);//加上函数声明之后可以将函数定义放在main函数之后

int main(){
    int a=10;
    int b=20;
    int c=max(a,b);
    cout << "Max: " << c << endl;
    return 0;
}   
int max(int a, int b){
    return (a>b)?a:b;
}
```
## 6.1函数的分文件编写
函数分文件编写一般有4个步骤
- 创建后缀名为.h的头文件
- 创建后缀名为.cpp的源文件
- 在头文件中写函数的声明
- 在源文件中写函数的定义
```cpp
//头文件
#include<iostream>
using namespace std;
int max(int a, int b);
//源文件
#include "max.h"
int max(int a, int b){
    return (a>b)?a:b;
}
//调用
#include<iostream>
using namespace std;
#include"max.h"
int main(){
    int a=10;
    int b=20;
    int c=max(a,b);
    cout << "Max: " << c << endl;
    return 0;
}   
```
# 7指针
## 7.1指针的基本概念
**指针的作用**:可以通过指针间接访问内存
- 内存编号是从0开始记录的，一般用十六进制数字表示
- 可以利用指针变量保存地址，也可以理解为指针就是地址
```cpp
#include<iostream>
using namespace std; 
int main(){
    int a=10;
    int * p;
    p = &a;
    cout << "a=" << a << endl;
    cout << "a=" << &a << endl;//输出变量a的地址,a和p的地址是一样的
    cout << "p=" << p << endl;//输出指针p的地址
    //指针前面加*号表示解引用，找到指针指向的地址，输出该地址的值
    cout << "*p=" << *p << endl;//输出指针p所指向的值
    * p = 20;//修改指针p所指向的值
    cout << "a=" << a << endl;//输出变量a的值
    return 0;
}   
```

## 7.2指针所占用的内存空间
指针也是数据类型，在32位操作系统下占用四个字节，64位8字节
```cpp
#include<iostream>
using namespace std; 
int main(){
    int a=10;
    int * p = &a;
    cout<<sizeof(p)<<endl;
    return 0;
}  
```
## 7.3空指针和野指针
**空指针**:指针变量指向内存中编号为0的空间
**用途**:初始化指针变量
**注意**:空指针指向的内存是不可以访问的
```cpp
#include<iostream>
using namespace std; 
int main(){
    int * p = NULL;//NULL其实就是0，0~255是系统占用的，不可访问
    * p =100;
    return 0;
}   
```
**野指针**：指针变量指向非法的内存空间
```cpp
#include<iostream>
using namespace std; 
int main(){
    //在程序中要避免出现野指针，野指针是指向一块已经释放的内存空间的指针变量。
    int * p = (int *)0x1100;//(int *)0x1100强制类型转换位整型
    cout<<* p<<endl;
    return 0;
}   
```
**总结**：野指针和空指针都不是我们自己申请的内存空间，所以不要访问他们

## 7.4const修饰指针
- const修饰指针 ---常量指针：指针的指向可以改，但是指针指向的值不能改，也就是地址可以改，但是内存中的值不能更改
```cpp
#include<iostream>
using namespace std; 
int main(){
    int a=10;
    int b=20;
    const int * p=&a;
    *p=20;//不可以改变内容
    p=&b;
    return 0;
}   
```
- const修饰常量 ---指针常量：指针的指向不可以改，但是指针指向的值可以更改
```cpp
#include<iostream>
using namespace std; 
int main(){
    int a=10;
    int b=20;
    int * const p=&a;
    *p=20;
    p=&b;//不可以改变地址
    return 0;
}   
```
- const即修饰指针，又修饰常量：指针的指向和指针指向的值都不能更改
```cpp
#include<iostream>
using namespace std; 
int main(){
    int a=10;
    int b=20;
    const int * const p=&a;
    *p=20;//不可以改变地址
    p=&b;//不可以改变地址
    return 0;
}   
```

## 7.6指针和数组
```cpp
#include<iostream>
using namespace std; 
int main(){
    int arr[]={1,2,3,4,5,6,7,8,9,10};
    int * p=arr;//数组首地址
    cout<<*p<<endl;
    // p++;//向后移动四个字节，因为int类型占四个字节
    // cout<<*p<<endl;
    for(int i=0;i<10;i++){
        cout<<*p++<<endl;
    }
    return 0;
}   
```

## 7.6指针和函数
**作用**：利用指针作函数参数，可以修改实参的值
```cpp
#include<iostream>
using namespace std; 
int swap01(int a, int b){
    int temp;
    temp = a;
    a = b;
    b = temp;
    return 0;
}
int swap02(int &a, int &b){
    //直接修改地址的值
    int temp;
    temp = a;
    a = b;
    b = temp;
    return 0;
}
//指针代表地址，此种做法相当于直接修改对应地址的值
int swap03(int *a, int *b){
    int temp;
    temp = *a;
    *a = *b;
    *b = temp;
    return 0;
}
int main(){
    int a=10;
    int b=20;
    // swap01(a,b);
    // swap02(a,b);
    swap03(&a,&b);
    cout<<a<<" "<<b<<endl;

    return 0;
}   
```
## 7.7指针、数组、函数
```cpp
//冒泡排序
#include<iostream>
using namespace std; 
//`arr` 传到函数里**退化成首元素指针 `int* arr`，这个指针保存的是原数组在内存里真实的起始地址，所以 `arr[j]` 等价于 `*(arr + j)`，直接访问、修改的就是 main 里那个原始数组的内存，不是拷贝副本。
void bubbleSort(int * arr, int n){
    for(int i=0;i<n-1;i++){
        for(int j=0;j<n-i-1;j++){
            if(arr[j]>arr[j+1]){
                swap(arr[j],arr[j+1]);
            }
        }
    }
}
int main(){
    int arr[]={7,1,6,4,8,3,2,5,9,0};
    bubbleSort(arr,10);
    for(int i=0;i<10;i++){
        cout<<arr[i]<<" ";
    }
    cout<<endl;
    return 0;
}   
```
# 8.结构体
结构体属于用户自定义的数据类型，允许用户存储不同的数据类型

## 8.1结构体定义和使用
**语法**:`struct 结构体名 {结构体成员列表}`;
通过结构体创建变量的方式有三种:
- struct结构体名 变量名
- struct结构体名 变量名={成员1值，成员2值...}
- 定义结构体时顺便创建变量
```cpp
#include<iostream>
using namespace std; 
#include<string>
struct Student{
    string a;
    int b;
    char c;
}s3;//3.在定义结构体的同时定义了一个结构体变量s3
int main(){
    Student s1;//1.struct结构体名 变量名,struct可以省略
    //s1 这个变量里面自带了这三个成员
    s1.a="John";
    s1.b=20;
    s1.c='A';
    cout<<s1.a<<" "<<s1.b<<" "<<s1.c<<endl;
    //2.struct结构体名 变量名={成员1值，成员2值...}
    struct Student s2={"Alice", 22, 'B'};//结构体内成员的初始化顺序必须与结构体定义中成员的顺序一致
    cout<<s2.a<<" "<<s2.b<<" "<<s2.c<<endl;
    s3.a="Bob";
    s3.b=25;
    s3.c='C';
    cout<<s3.a<<" "<<s3.b<<" "<<s3.c<<endl;
    return 0;
}   
```

## 8.2结构体和数组
**作用**：将自定义的结构体放入到数组中方便维护
**语法**：`struct 结构体名 数组名[元素个数]={{},{}…{}}`
```cpp
#include<iostream>
using namespace std; 
#include<string>
struct Student{
    string name;
    int age;
    char score;
};
int main(){
    struct Student stuarry[3] = {{"张三",18,'A'},{"李四",19,'B'},{"王五",20,'C'}};
    stuarry[0].name = "赵六";//结构体中的内容可以更改
    for(int i=0;i<3;i++){
        cout<<"姓名:"<<stuarry[i].name<<"\t年龄:"<<stuarry[i].age<<"\t成绩:"<<stuarry[i].score<<endl;
    }
    return 0;
}   
```

## 8.3结构体指针
- 利用操作符`->`可以通过结构体指针访问结构体属性
```cpp
#include<iostream>
using namespace std; 
#include<string>
struct Student{
    string name;
    int age;
    char score;
};
int main(){
    struct Student stuarry[3] = {{"张三",18,'A'},{"李四",19,'B'},{"王五",20,'C'}};
    Student *p = stuarry;
    for(int i = 0; i < 3; i++){
        cout << "姓名：" << p->name << "\t年龄：" << p->age << "\t成绩：" << p->score << endl;//通过结构体指针访问结构体中的属性，必须使用->
        p++;
    }
    return 0;
} 
```
## 8.4结构体嵌套结构体
**作用**：结构体中的成员可以是另一个结构体
```cpp
#include<iostream>
using namespace std; 
#include<string>
struct student{
    string name;
    int age;
    char score;
};
struct teacher{
    string name;
    int age;
    char score;
    student stu;
};
int main(){
    teacher t = {"张老师", 30, 'A', };
    t.stu.name = "小明";
    t.stu.age = 20;
    t.stu.score = 'B';
    cout << "老师姓名：" << t.name << "\t老师年龄：" << t.age << "\t老师成绩：" << t.score << endl;
    cout << "学生姓名：" << t.stu.name << "\t学生年龄：" << t.stu.age << "\t学生成绩：" << t.stu.score << endl;
    return 0;
}   
```

## 8.5结构体做函数参数
**作用**：将结构体作为参数向函数中传递，传递方式分为值传递和地址传递
```cpp
#include<iostream>
using namespace std; 
#include<string>
struct student{
    string name;
    int age;
    char score;
};
void print(student s){//传入的是值,修改的是副本
    s.name="lisi";
    cout<<s.name<<endl;
    cout<<s.age<<endl;
    cout<<s.score<<endl;
}
void print2(student * p){//传入的是地址,直接修改原来的值
    p->name="lisi";
    cout<<p->name<<endl;
    cout<<p->age<<endl;
    cout<<p->score<<endl;
}
int main(){
    student s1={"zhangsan",18,'A'};
    print(s1);
    cout<<s1.name<<endl;
    print2(&s1);
    cout<<s1.name<<endl;
    return 0;
}   
```

## 8.6结构体中const使用场景
**作用**：防止误操作
```cpp
#include<iostream>
using namespace std; 
#include<string>
struct student{
    string name;
    int age;
    char score;
};
//将函数中的形参改为指针，可以减少内存空间，而且不会复制新的副本出来
void print2(const student * p){
    p->name="lisi";//加上const之后这里就是不对的，会报错
    cout<<p->name<<endl;
    cout<<p->age<<endl;
    cout<<p->score<<endl;
}
int main(){
    student s1={"zhangsan",18,'A'};
    cout<<s1.name<<endl;
    print2(&s1);
    cout<<s1.name<<endl;
    return 0;