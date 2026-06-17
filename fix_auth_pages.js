const fs = require('fs');

const files = {
    'src/app/login/page.tsx': `export default function LoginPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
                <p className="mt-2 text-sm text-slate-500">Sign in to continue managing your errands.</p>
            </div>
        </main>
    );
}
`,
    'src/app/register/page.tsx': `export default function RegisterPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                <h1 className="text-2xl font-semibold text-slate-900">Create your account</h1>
                <p className="mt-2 text-sm text-slate-500">Join Errand to request shopping help and track deliveries.</p>
            </div>
        </main>
    );
}
`
};

for (const [filePath, content] of Object.entries(files)) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Wrote ${filePath}`);
}
