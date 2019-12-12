const db = require('./db.js')
var inquirer = require('inquirer');

module.exports.add = async (title) => {
    // 读取之前的任务
    const list = await db.read()

    // 往里面添加一个 title 任务
    list.push({ title, done: false })

    // 存储任务到文件
    await db.write(list).then(() => {
        console.log('添加成功')
    }, () => {
        console.log('添加失败')
    })
}

module.exports.clear = async () => {
    await db.write([]).then(() => {
        console.log('清除成功')

    }, () => {
        console.log('清除失败')
    })
}

module.exports.showAll = async () => {
    const list = await db.read()
    list.map((item, index) => {
        console.log(`${item.done ? '[√]' : '[x]'} ${index + 1} - ${item.title}`)
    })
    inquirer
        .prompt({
            type: 'list',
            name: 'list',
            message: '请选择你想操作的任务',
            choices: [{ name: '退出', value: '-1' }, ...list.map((item, index) => {
                return { name: `${item.done ? '[√]' : '[x]'} ${index + 1} - ${item.title}`, value: index.toString() }
            }), { name: '添加', value: '-2' }]
        }).then(res => {
            index = parseInt(res.list)
            if (index >= 0) {
                inquirer
                    .prompt({
                        type: 'list',
                        name: 'action',
                        message: '请选择你想操作的任务',
                        choices: [
                            { name: '退出', value: 'quit' },
                            { name: '标记为已完成', value: 'markAsDone' },
                            { name: '标记为未完成', value: 'markAsUnDone' },
                            { name: '修改名字', value: 'change' },
                            { name: '删除', value: 'delete' },
                        ]
                    }).then(res1 => {
                        switch (res1.action) {
                            case 'markAsDone':
                                list[index].done = true;
                                db.write(list);
                                break;
                            case 'markAsUnDone':
                                list[index].done = false;
                                db.write(list);
                                break;
                            case 'change':
                                inquirer
                                    .prompt({
                                        type: 'input',
                                        name: 'title',
                                        message: '新的标题',
                                        default: list[index].title
                                    }).then(res3=>{
                                        list[index].title = res3.title;
                                        db.write(list);
                                    })
                                break;
                            case 'delete':
                                list.splice(index, 1);
                                db.write(list);
                                break;
                        }
                    })
            } else if (index === -2) {
                inquirer
                .prompt({
                    type: 'input',
                    name: 'title',
                    message: '新的标题',
                }).then(res4=>{
                    list.push({title:res4.title,done:false})
                    db.write(list);
                })
            }
        })
}    