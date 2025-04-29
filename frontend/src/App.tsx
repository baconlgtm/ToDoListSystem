import { ApolloProvider } from '@apollo/client';
import { client } from './lib/apollo';
import TodoListContainer from './components/TodoListContainer';

function App() {
    return (
        <ApolloProvider client={client}>
            <div className="min-h-screen bg-gray-100">
                <header className="bg-white shadow">
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                        <h1 className="text-3xl font-bold text-gray-900">Your Task Manager</h1>
                    </div>
                </header>
                <main>
                    <TodoListContainer />
                </main>
            </div>
        </ApolloProvider>
    );
}

export default App;
