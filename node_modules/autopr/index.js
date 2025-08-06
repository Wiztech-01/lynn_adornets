#!/usr/bin/env node

const { spawn } = require('child_process')
const readline = require('readline')
const open = require('open')

async function main() {
    const starting_branch = await get_branch_name()
    let data = await shell(
        'git',
        'rev-list',
        '--count',
        starting_branch,
        `"^origin/${starting_branch}"`
    )
    if (parseInt(data.trim()) === 0) {
        throw 'ERROR: No commits to turn into pull request.\n' +
            'Commit your changes before running this command.'
    }

    let branch_name = await prompt_branch_name()
    // Create and checkout new branch
    await shell('git', 'checkout', '-b', branch_name)
    // Reset master to the previous state
    await shell(
        'git',
        'update-ref',
        'refs/heads/' + starting_branch,
        'refs/remotes/origin/' + starting_branch
    )

    try {
        await exec('git', 'push', '--set-upstream', 'origin ' + branch_name)
    } catch (err) {
        if (!err.includes('SIGINT')) throw err

        console.log('Push interrupted: Switching back to ' + starting_branch)

        await shell(
            'git',
            'update-ref',
            'refs/heads/' + starting_branch,
            'refs/heads/' + branch_name
        )
        await shell('git', 'checkout', starting_branch)
        await shell('git', 'branch', '-d', branch_name)

        return
    }

    await launch_pr_wizard(starting_branch)
}

async function prompt_branch_name() {
    let initial_guess = process.argv.slice(2)[0] || ''

    return await validated_prompt(initial_guess, 'Choose a branch name: ', async name => {
        if (!name.trim()) return 'Branch can not be empty'
        if (!/^(?!\/|.*([/.]\.|\/\/|@\{|\\\\))[^\040\177 ~^:?*\[]+(?<!\.lock|[/.])$/.test(name))
            return 'Invalid branch name'
        if ((await shell('git', 'show-ref', 'refs/heads/' + name).catch(k => '')).trim())
            return 'Branch already exists'
    })
}

async function get_branch_name() {
    let data
    data = await shell('git', 'rev-parse', '--abbrev-ref HEAD')
    return data.trim()
}

async function get_repo_url() {
    let data = await shell('git', 'remote', '-v')
    let remotes = data
        .trim()
        .split('\n')
        .filter(k => k.includes('github'))
    if (!remotes[0]) throw 'ERROR: no Github remotes found'
    return (
        'http://' +
        remotes[0]
            .split(/\s/)[1]
            .replace('git://', '')
            .replace('git@', '')
            .replace('https://', '')
            .replace('ssh://', '')
            .replace(':', '/')
            .replace(/\.git$/, '')
    )
}

async function launch_pr_wizard(target) {
    let branch_name = await get_branch_name()
    let repo_url = await get_repo_url()

    let pr_url = repo_url + '/pull/new/' + target + '...' + branch_name
    console.log('Opening ' + pr_url)
    await open(pr_url)
}

async function validated_prompt(initial, question, validate) {
    if (initial) {
        let warning = await validate(initial)
        if (!warning) return initial
        console.log(warning)
    }
    while (true) {
        let result = await prompt(question)
        let warning = await validate(result)
        if (!warning) return result
        console.log(warning)
    }
}

function prompt(question) {
    return new Promise(resolve => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        })
        rl.question(question, result => {
            resolve(result)
            rl.close()
        })
    })
}

function exec(cmd, ...args) {
    return _shell(cmd, args, true)
}

function shell(cmd, ...args) {
    return _shell(cmd, args, false)
}

function _shell(cmd, args, log) {
    return new Promise((resolve, reject) => {
        if (log) console.log(`> ${cmd} ${args.join(' ')}`)
        const proc = spawn(cmd, args, { shell: true })
        let text = ''
        proc.stdout.setEncoding('utf8')
        proc.stdout.on('data', chunk => {
            text += chunk
            if (log) process.stdout.write(chunk)
        })
        proc.stderr.setEncoding('utf8')
        proc.stderr.on('data', chunk => {
            text += chunk
            if (log) process.stderr.write(chunk)
        })
        const sigint_handler = () => {
            proc.kill() // pay it forward
        }
        process.on('SIGINT', sigint_handler)
        proc.on('close', (code, signal) => {
            process.off('SIGINT', sigint_handler)
            if (code !== 0) {
                reject(`Command ${cmd} failed with return code ${code} and signal ${signal}`)
            } else {
                resolve(text)
            }
        })
    })
}

main().catch(err => {
    console.log(err || 'ERROR: ABORT')
})
