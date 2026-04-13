import React from 'react'
import Icon from "../Icon";

const Footer = () => {
    return (
        <footer className="border-t border-slate-200/70 bg-white/90 px-5 py-4 sm:px-8">
            <div className="card rounded-[1.75rem] border border-white/80 bg-white shadow-[0_16px_36px_rgba(15,23,42,0.08)]">
                <div className="card-body flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            className="btn btn-circle h-14 min-h-14 w-14 border-none bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-500"
                            type="button"
                        >
                            <Icon name="play" className="size-6" />
                        </button>
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-indigo-500">
                                Currently Curating
                            </p>
                            <p className="text-base font-semibold text-slate-900">
                                Midnight in Berlin (Edit)
                            </p>
                            <p className="text-sm text-slate-500">Luna Trace - Dark Synth EP</p>
                        </div>
                    </div>

                    <div className="flex flex-1 items-center gap-4 lg:max-w-xl">
                        <span className="text-xs text-slate-400">1:45</span>
                        <div className="h-1.5 flex-1 rounded-full bg-slate-200">
                            <div className="h-1.5 w-1/2 rounded-full bg-indigo-500" />
                        </div>
                        <span className="text-xs text-slate-400">3:24</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-500">
                        <button className="btn btn-circle btn-ghost" type="button">
                            <Icon name="expand" className="size-5" />
                        </button>
                        <button className="btn btn-circle btn-ghost" type="button">
                            <Icon name="previous" className="size-5" />
                        </button>
                        <button
                            className="btn btn-circle border-none bg-indigo-600 text-white hover:bg-indigo-500"
                            type="button"
                        >
                            <Icon name="pause" className="size-5" />
                        </button>
                        <button className="btn btn-circle btn-ghost" type="button">
                            <Icon name="next" className="size-5" />
                        </button>
                        <button className="btn btn-circle btn-ghost" type="button">
                            <Icon name="volume" className="size-5" />
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer