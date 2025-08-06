# autopr

Do you ever feel crippled by the anxiety of having to decide the name of a branch to create in Git,
before you're sure what you're doing next?

`autopr` is a new tool that lets you procrastinate on this most particular of modern plights!

Now you don't have to decide what to name a branch until the _last-possible_ moment— mere seconds
before you poke your coworkers to review your pull request!

With `autopr` you'll have the idle time while coding to mull over a better branch name with more
brevity or wit. Maybe with the additional time, you'll even earn a fleeting grin or muted groan!

And for those situations where you poke around a bit and realize there's something else that you
should be doing instead— you won't find your `git branch` littered with the carcasses of intentions
that fell by the wayside.

Will `autopr` solve world hunger? Nah. But at least it probably won't cause it. _probably_.

## how to use it

1. Commit your changes on top of `master` with reckless abandon

2. Instead of pushing, run `apr my-new-branch-name` and it'll transfer all your your new
   `my-new-branch-name` branch, while resetting `master` to its old state. It'll then automatically
   push `my-new-branch-name` to the remote origin, and open the pull request creation wizard in your
   browser.

3. Grab a nerf gun to prod those unfortunate souls around you deigned to review your request

## how to install it

```
npm install -g autopr
```

This will install the `autopr` command and its more suave and stylish _nom de guerre_ `apr`

## atomicity and stuff

The author of this library has taken great pains to make the library essentially "atomic". That is,
if you press `Ctrl-C` while the command is running and interrupt it- it'll undo what it has done so
you don't wind up in some silly intermediate state.

Thus if you make a mistake and didn't really mean to move your committed changes into a new branch
and push it to the remote, you have a few precious seconds to abort, and it'll be as if you hadn't
run `apr` at all.

## what else

I donno.
