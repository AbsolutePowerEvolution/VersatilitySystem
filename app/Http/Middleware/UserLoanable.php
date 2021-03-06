<?php

namespace App\Http\Middleware;

use Closure;
use Carbon\Carbon;
use App\Affair\Category;
use App\Affair\Timezone;

class UserLoanable
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        if (
            \Entrust::hasRole('student') &&
            $request->input('type') == Category::getCategoryId('loan.type', 'interview')
        ) {
            $judge_column = 'stu_date_began_at';
        } else {
            $judge_column = 'date_began_at';
        }

        $timezone = Timezone::
            whereRaw("? BETWEEN `$judge_column` AND `date_ended_at`", [Carbon::now()->toDateString()])
            ->where('date_began_at', '<=', $request->input('date_began_at'))
            ->where('date_ended_at', '>=', $request->input('date_ended_at'))
            ->first();

        if ($timezone != null) {
            $request->merge([
                'timezone' => $timezone,
                'long_term_token' => bindec($request->input('long_term_token')),
            ]);

            return $next($request);
        } else {
            return abort(403);
        }
    }
}
